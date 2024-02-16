import { NestedObject, Interval, Coord, Attributes } from './types';
import SashimiPlot from '../components/Main/Explore/ExploreGene/SashimiPlot/SashimiPlot';

export const sum_of_leaves = (obj: NestedObject): number => {
  let total = 0;

  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      // If it's a terminal number, add it to the total
      total += obj[key] as number;
    } else if (typeof obj[key] === 'object') {
      // If it's a nested object, recursively call the function
      total += sum_of_leaves(obj[key] as NestedObject);
    }
  }

  return total;
};

function cut(chain: [number, number][], s: number, e: number): [number, number][] {
  const dup = chain.map(tuple => [...tuple]);

  if (s <= dup[0][0] && e >= dup[dup.length - 1][1]) {
    return dup;
  }

  const tmp: [number, number][] = [];

  for (let i = 0; i < dup.length; i++) {
    const c = dup[i];

    if (c[0] <= s && c[1] >= s) {
      dup[i][0] = s;
      c[0] = s;
    }

    if (c[1] >= e) {
      dup[i][1] = e;
      c[1] = e;
    }

    if (c[1] < s || c[0] > e) {
      continue;
    }

    tmp.push(c);
  }

  return tmp;
}

function slen(s: [number, number]): number {
  return s[1] - s[0] + 1;
}

function clen(chain: [number, number][]): number {
  let res = 0;

  for (const c of chain) {
    res += slen(c);
  }

  return res;
}

export class TX {
  seqid: string | null = null;
  strand: string | null = null;
  exons: Interval[] = [];
  orf: Interval[] = [];

  tid: string | null = null;
  attrs: Attributes = {};

  txs: TX[] = []; // if a transcript has alternative versions - they are stored here

  parent_tid: string | null = null;

  gene_dbID: string | null = null;
  gene_id: string | null = null;
  gene_name: string | null = null;

  svg: any = null;

  clear(): void {
    this.seqid = null;
    this.strand = null;
    this.exons = [];
    this.orf = [];

    this.tid = null;
    this.attrs = {};

    this.txs = [];

    this.parent_tid = null;

    this.gene_dbID = null;
    this.gene_id = null;
    this.gene_name = null;

    this.svg = null;
  }

  set_gene(dbID: string, gene_id: string, gene_name: string): void {
    this.gene_dbID = dbID;
    this.gene_id = gene_id;
    this.gene_name = gene_name;
  }

  set_parent(parent_tid: string): void {
    this.parent_tid = parent_tid;
  }

  set_seqid(seqid: string): void {
    this.seqid = seqid;
  }

  set_strand(strand: string): void {
    this.strand = strand;
  }

  set_exons(exons: Interval[]): void {
    this.exons = [...exons];
  }

  build_orf(start: number, end: number): void {
    this.orf = cut(this.exons, start, end);
  }

  add_exon(exon: Interval): void {
    this.exons.push(exon);
  }

  set_tid(tid: string): void {
    this.tid = tid;
  }

  nume(): number {
    return this.exons.length;
  }

  numc(): number {
    return this.orf.length;
  }

  *get_introns(): Generator<[number, number]> {
    if (this.exons.length > 1) {
      for (let i = 0; i < this.exons.length - 1; i++) {
        yield [this.exons[i][1], this.exons[i + 1][0]];
      }
    }
  }

  *get_exons(): Generator<Interval> {
    for (const e of this.exons) {
      yield e;
    }
  }

  *get_cds(): Generator<Interval> {
    for (const c of this.orf) {
      yield c;
    }
  }

  get_tid(): string | null {
    return this.tid;
  }

  add_attr(attr: string, val: string): void {
    this.attrs[attr] = val;
  }
  get_attr(attr: string): string {
    return this.attrs[attr] || "";
  }

  get_strand(): string | null {
    return this.strand;
  }

  get_seqid(): string | null {
    return this.seqid;
  }

  get_start(): number {
    return this.exons[0][0];
  }

  get_end(): number {
    return this.exons[this.exons.length - 1][1];
  }

  get_cstart(): number {
    return this.orf[0][0];
  }

  get_cend(): number {
    return this.orf[this.orf.length - 1][1];
  }

  add_tx(tx: TX): void {
    this.txs.push(tx);
  }

  set_start(start: number): void {
    this.exons[0] = [start, this.exons[0][1]];
  }

  set_end(end: number): void {
    this.exons[this.exons.length - 1] = [this.exons[this.exons.length - 1][0], end];
  }

  set_svg(svg: any){
    this.svg = svg;
  }
}

export class Locus {
  txs: TX[] = [];
  ref_tx: number | null = null;
  seqid: string | null = null;
  strand: string | null = null

  intervals: Interval[] = [];  // union of all exons in the locus (minus the introns)

  exon_starts: Set<number> = new Set();
  exon_ends: Set<number> = new Set();

  start: number = Number.MAX_SAFE_INTEGER;
  end: number = 0;

  graphcoords: number[] | null = null;
  graphToGene: { [key: number]: number } | null = null;

  max_graphcoord: number = 0;

  settings = {
    intron_scale: 20,
    exon_scale: 1,
    reverse: false,
  };

  constructor() {
    this.init();
  }

  init(): void {
    this.txs = [];
    this.ref_tx = null;
    this.seqid = null;
    this.strand = null;

    this.intervals = [];

    this.exon_starts = new Set();
    this.exon_ends = new Set();

    this.start = Number.MAX_SAFE_INTEGER;
    this.end = 0;

    this.graphcoords = null;
    this.graphToGene = null;

    this.max_graphcoord = 0;

    this.settings = {
      intron_scale: 20,
      exon_scale: 1,
      reverse: false,
    };
  }

  set_intron_scale(intron_scale: number): void {
    this.settings.intron_scale = intron_scale;
  }
  set_exon_scale(exon_scale: number): void {
    this.settings.exon_scale = exon_scale;
  }
  set_reverse(reverse: boolean): void {
    this.settings.reverse = reverse;
  }
  get_intron_scale(): number {
    return this.settings.intron_scale;
  }
  get_exon_scale(): number {
    return this.settings.exon_scale;
  }
  is_reverse(): boolean {
    return this.settings.reverse;
  }

  static cubic_bezier(pts: [Coord, Coord, Coord, Coord], t: number): number[] {
    const [p0, p1, p2, p3] = pts;
    const p0Array = [p0[0], p0[1]];
    const p1Array = [p1[0], p1[1]];
    const p2Array = [p2[0], p2[1]];
    const p3Array = [p3[0], p3[1]];
    return [
      p0Array[0] * (1 - t) ** 3 + 3 * t * p1Array[0] * (1 - t) ** 2 + 3 * t ** 2 * (1 - t) * p2Array[0] + t ** 3 * p3Array[0],
      p0Array[1] * (1 - t) ** 3 + 3 * t * p1Array[1] * (1 - t) ** 2 + 3 * t ** 2 * (1 - t) * p2Array[1] + t ** 3 * p3Array[1]
    ];
  }

  static union(intervals: Interval[]): Interval[] {
    const res: Interval[] = [];
    for (const pos of intervals.sort()) {
      if (res.length > 0 && res[res.length - 1][1] >= pos[0] - 1) {
        res[res.length - 1][1] = Math.max(res[res.length - 1][1], pos[1]);
      } else {
        res.push([pos[0], pos[1]]);
      }
    }
    return res;
  }

  add_tx(tx: TX): void {
    if (!(this.seqid === null || this.seqid === tx.get_seqid())) {
      throw new Error("Locus.add_tx(): seqid mismatch");
    }
    if (!(this.strand === null || this.strand === tx.get_strand())) {
      throw new Error("Locus.add_tx(): strand mismatch");
    }

    this.seqid = tx.get_seqid();
    this.strand = tx.get_strand();

    // Update intervals using list
    this.intervals = Locus.union([...this.intervals, ...tx.exons]);

    for (const pos of tx.exons) {
      this.exon_starts.add(pos[0]);
      this.exon_ends.add(pos[1]);
    }

    if (tx.get_start() < this.start) {
      this.start = tx.get_start();
    }

    if (tx.get_end() > this.end) {
      this.end = tx.get_end();
    }

    this.txs.push(tx);
  }

  get_start(): number {
    return this.start;
  }

  get_end(): number {
    return this.end;
  }

  get_length(): number {
    return this.end - this.start + 1;
  }

  set_scaling(): void {
    const exoncoords: number[] = new Array(this.end - this.start + 1).fill(0);
    for (const es of this.intervals) {
      for (let i = es[0]; i <= es[1]; i++) {
        exoncoords[i - this.start] = 1;
      }
    }

    this.graphToGene = {};
    this.graphcoords = new Array(this.end - this.start + 1).fill(0);
    let x = 0;

    for (let i = 0; i < this.end - this.start + 1; i++) {
      const iloc:number = (this.strand === '+' || !this.settings.reverse) ? i : -(i + 1);
      const icoord:number = (this.strand === '+' || !this.settings.reverse) ? i + this.start : this.end - i + 1;
     
      this.graphcoords[iloc] = x;
      this.graphToGene[Math.floor(x)] = icoord;

      if (exoncoords[iloc] === 1) {
        x += 1 / this.settings.exon_scale;
      } else {
        x += 1 / this.settings.intron_scale;
      }
    }

    this.max_graphcoord = x;
  }

  convert(gene_coord: number, limits:[number,number]|null=null): number {
    if (this.graphcoords === null) {
      return 0;
    }
    else {
      const coord = this.graphcoords[gene_coord - this.start];
      if (limits === null) {
        return coord;
      }
      else {
        const res = ((coord)/this.max_graphcoord)*(limits[1]-limits[0])+limits[0];
        return (res);
      }
    }
  }
}