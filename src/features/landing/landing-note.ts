type Stroke = {
  path: SVGPathElement;
  length: number;
  matrix: DOMMatrix;
  from: DOMPoint;
  to: DOMPoint;
  travelStart: number;
  start: number;
  end: number;
};

type Note = { ink: SVGGElement; bounds: DOMRect; strokes: Stroke[]; end: number; nextStroke: number };
type Crumb = { path: SVGPathElement; release: number; drift: number; spin: number; scale: number };

const pencilExit = 260;
const readingTime = 1550;
const erasingTime = 1320;
const betweenNotes = 555;
const crumbFallTime = 750;

const prepareUnderline = (ink: SVGGElement) => {
  const lettering = ink.querySelector<SVGGElement>(".landing-note__lettering")!;
  const underline = ink.querySelector<SVGPathElement>(".landing-note__underline")!;
  const { x, y, width, height } = lettering.getBBox();
  const baseline = y + height + 6;
  underline.setAttribute("d", `M${x - 1} ${baseline + 1}C${x + width * .3} ${baseline - 2} ${x + width * .68} ${baseline} ${x + width + 1} ${baseline + 1}`);
};

const placeNote = (ink: SVGGElement) => {
  const writing = ink.querySelector<SVGGElement>(".landing-note__writing")!;
  const { x, y, width, height } = writing.getBBox();
  const left = 25 + Math.random() * Math.max(0, 337 - 25 - width);
  const top = 42 + Math.random() * Math.max(0, 136 - 42 - height);
  writing.setAttribute("transform", `translate(${left - x} ${top - y})`);
};

const readNote = (ink: SVGGElement, rootMatrix: DOMMatrix): Note => {
  let end = 0;
  let previousPoint: DOMPoint | undefined;
  const strokes = [...ink.querySelectorAll("path")].flatMap(path => {
    const pathMatrix = path.getCTM();
    if (!pathMatrix) return [];
    const matrix = rootMatrix.multiply(pathMatrix);
    const length = path.getTotalLength();
    const from = path.getPointAtLength(0).matrixTransform(matrix);
    const to = path.getPointAtLength(length).matrixTransform(matrix);
    const distance = previousPoint ? Math.hypot(from.x - previousPoint.x, from.y - previousPoint.y) : 0;
    const travelStart = end;
    const start = travelStart + Math.min(290, 25 + distance * 2.15);
    end = start + Math.min(680, Math.max(52, length * 4.25));
    previousPoint = to;
    return [{ path, length, matrix, from, to, travelStart, start, end }];
  });
  return { ink, bounds: ink.getBBox(), strokes, end, nextStroke: 0 };
};

class LandingNote extends HTMLElement {
  private readonly preference = matchMedia("(prefers-reduced-motion: reduce)");
  private observer?: IntersectionObserver;
  private controller?: AbortController;
  private frame?: number;
  private lastFrame?: number;
  private elapsed = 0;
  private visible = false;
  private paused = false;
  private topics: SVGGElement[] = [];
  private queue: SVGGElement[] = [];
  private current?: Note;
  private surface!: SVGSVGElement;
  private hand!: SVGGElement;
  private eraser!: SVGGElement;
  private wipe!: SVGRectElement;
  private toggle!: HTMLButtonElement;
  private crumbs: Crumb[] = [];

  connectedCallback() {
    const surface = this.querySelector<SVGSVGElement>(".landing-notes");
    if (!surface) return;

    this.surface = surface;
    this.topics = [...surface.querySelectorAll<SVGGElement>(".landing-note__ink")];
    this.topics.forEach(prepareUnderline);
    this.hand = surface.querySelector<SVGGElement>(".landing-note__hand")!;
    this.eraser = surface.querySelector<SVGGElement>(".landing-note__eraser")!;
    this.wipe = surface.querySelector<SVGRectElement>(".landing-note__wipe")!;
    this.toggle = this.querySelector<HTMLButtonElement>("button")!;
    const particles = [...surface.querySelectorAll<SVGPathElement>(".landing-note__crumbs path")];
    this.crumbs = particles.map((path, index) => ({
      path,
      release: erasingTime * (.12 + .77 * index / particles.length),
      drift: (Math.random() - .5) * 34,
      spin: (Math.random() - .5) * 300,
      scale: .65 + Math.random() * .7,
    }));

    this.controller = new AbortController();
    const { signal } = this.controller;
    this.preference.addEventListener("change", this.updatePlayback, { signal });
    document.addEventListener("visibilitychange", this.updatePlayback, { signal });
    this.toggle.addEventListener("click", () => {
      this.paused = !this.paused;
      this.updatePlayback();
    }, { signal });
    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting && entry.intersectionRatio >= .1;
      this.updatePlayback();
    }, { threshold: .1 });
    this.observer.observe(surface);
    this.updatePlayback();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.controller?.abort();
    this.stopFrame();
    this.visible = false;
  }

  private stopFrame() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.lastFrame = undefined;
  }

  private updatePlayback = () => {
    const reduced = this.preference.matches;
    this.toggle.hidden = reduced;
    this.toggle.toggleAttribute("data-paused", this.paused);
    this.toggle.setAttribute("aria-label", this.paused ? "손글씨 애니메이션 재생" : "손글씨 애니메이션 일시 정지");

    if (reduced) {
      this.stopFrame();
      this.showStill();
      return;
    }
    if (document.hidden || !this.visible || this.paused) {
      this.stopFrame();
      return;
    }
    if (this.frame !== undefined) return;
    if (!this.current) this.startNote();
    if (this.current) this.frame = requestAnimationFrame(this.tick);
  };

  private showStill() {
    const ink = this.current?.ink ?? this.topics[0];
    this.showTopic(ink);
    for (const path of ink.querySelectorAll("path")) {
      path.removeAttribute("stroke-dasharray");
      path.removeAttribute("stroke-dashoffset");
    }
    this.clearTools();
    this.current = undefined;
  }

  private showTopic(ink: SVGGElement) {
    this.wipe.setAttribute("x", "0");
    for (const topic of this.topics) topic.setAttribute("opacity", topic === ink ? "1" : "0");
    this.surface.setAttribute("aria-label", "손글씨 메모, " + ink.dataset.topic);
  }

  private startNote() {
    const previous = this.current?.ink ?? this.topics.find(ink => ink.getAttribute("opacity") === "1");
    if (!this.queue.length) {
      this.queue = [...this.topics];
      for (let index = this.queue.length - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1));
        [this.queue[index], this.queue[swap]] = [this.queue[swap], this.queue[index]];
      }
      if (this.current && this.queue[0] === previous) {
        [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
      }
    }
    const rootMatrix = this.surface.getCTM()?.inverse();
    if (!rootMatrix) return;
    const ink = this.queue.shift()!;
    placeNote(ink);
    const note = readNote(ink, rootMatrix);
    if (!note.strokes.length) return;

    this.current = note;
    this.elapsed = 0;
    this.clearTools();
    for (const { path, length } of note.strokes) {
      path.setAttribute("stroke-dasharray", String(length + 1));
      path.setAttribute("stroke-dashoffset", String(length + 1));
    }
    this.showTopic(ink);
  }

  private clearTools() {
    this.hand.setAttribute("opacity", "0");
    this.eraser.setAttribute("opacity", "0");
    for (const { path } of this.crumbs) path.setAttribute("opacity", "0");
  }

  private write(note: Note, elapsed: number) {
    while (note.nextStroke < note.strokes.length && elapsed >= note.strokes[note.nextStroke].end) {
      note.strokes[note.nextStroke].path.removeAttribute("stroke-dashoffset");
      note.nextStroke++;
    }

    const stroke = note.strokes[note.nextStroke];
    if (!stroke) {
      const last = note.strokes[note.strokes.length - 1];
      const leaving = Math.min(1, (elapsed - note.end) / pencilExit);
      this.hand.setAttribute("opacity", String(1 - leaving));
      this.hand.setAttribute("transform", `translate(${last.to.x + 20 * leaving} ${last.to.y - 10 * leaving})`);
      return;
    }

    const drawing = elapsed >= stroke.start;
    const progress = (elapsed - stroke.start) / (stroke.end - stroke.start);
    const previous = note.strokes[note.nextStroke - 1]?.to ?? stroke.from;
    const travel = (elapsed - stroke.travelStart) / (stroke.start - stroke.travelStart);
    const eased = travel * travel * (3 - 2 * travel);
    const point = drawing
      ? stroke.path.getPointAtLength(stroke.length * progress).matrixTransform(stroke.matrix)
      : { x: previous.x + (stroke.from.x - previous.x) * eased, y: previous.y + (stroke.from.y - previous.y) * eased };
    if (drawing) stroke.path.setAttribute("stroke-dashoffset", String(stroke.length * (1 - progress)));
    const lift = drawing ? 0 : -Math.sin(Math.PI * travel) * 4;
    this.hand.setAttribute("opacity", String(Math.min(1, elapsed / 100)));
    this.hand.setAttribute("transform", `translate(${point.x} ${point.y + lift})`);
  }

  private eraserEdge(bounds: DOMRect, progress: number) {
    return bounds.x - 5 + (bounds.width + 12) * progress;
  }

  private erase(bounds: DOMRect, progress: number) {
    const edge = this.eraserEdge(bounds, progress);
    const rub = Math.sin(progress * Math.PI * 8);
    this.wipe.setAttribute("x", String(edge));
    this.eraser.setAttribute("opacity", String(Math.min(1, progress * 12, (1 - progress) * 8)));
    this.eraser.setAttribute("transform", `translate(${edge + rub * 7} ${bounds.y + bounds.height - 5 + rub * 14}) rotate(${rub * 8})`);
  }

  private dropCrumbs(bounds: DOMRect, timeSinceErasing: number) {
    for (const { path, release, drift, spin, scale } of this.crumbs) {
      const fall = (timeSinceErasing - release) / crumbFallTime;
      if (fall < 0) continue;
      if (fall >= 1) {
        path.setAttribute("opacity", "0");
        continue;
      }
      const edge = this.eraserEdge(bounds, release / erasingTime);
      const x = edge - 7 + drift * fall;
      const y = bounds.y + bounds.height - 5 + 25 * fall + 225 * fall * fall;
      const opacity = Math.min(1, fall * 18, (1 - fall) * 3) * .72;
      path.setAttribute("opacity", String(opacity));
      path.setAttribute("transform", `translate(${x} ${y}) rotate(${spin * fall}) scale(${scale})`);
    }
  }

  private tick = (time: number) => {
    const note = this.current!;
    this.elapsed += time - (this.lastFrame ?? time);
    this.lastFrame = time;
    const eraseStart = note.end + pencilExit + readingTime;
    const nextStart = eraseStart + erasingTime + betweenNotes;

    if (this.elapsed >= nextStart) {
      this.startNote();
    } else if (this.elapsed >= eraseStart) {
      const erasing = this.elapsed - eraseStart;
      this.hand.setAttribute("opacity", "0");
      this.erase(note.bounds, Math.min(1, erasing / erasingTime));
      this.dropCrumbs(note.bounds, erasing);
    } else {
      this.write(note, this.elapsed);
    }

    this.frame = requestAnimationFrame(this.tick);
  };
}

if (!customElements.get("landing-note")) customElements.define("landing-note", LandingNote);
