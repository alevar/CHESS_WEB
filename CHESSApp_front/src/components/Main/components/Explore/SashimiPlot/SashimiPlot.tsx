import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface Coord {
  0: number;
  1: number;
}

interface Interval {
  0: number;
  1: number;
}

interface Attributes {
  [key: string]: string;
}

class TX {
  seqid: string | null = null;
  strand: string | null = null;
  exons: Interval[] = [];
  orf: Interval[] = [];

  tid: string | null = null;
  attrs: Attributes = {};

  clear(): void {
    this.seqid = null;
    this.strand = null;
    this.exons = [];
    this.orf = [];

    this.tid = null;
    this.attrs = {};
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

  set_orf(orf: Interval[]): void {
    this.orf = [...orf];
  }

  add_exon(exon: Interval): void {
    this.exons.push(exon);
  }

  add_cds(cds: Interval): void {
    this.orf.push(cds);
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
}

class Locus{
  txs: TX[] = [];
  ref_tx: number | null = null;
  seqid: string | null = null;
  strand: string | null = null

  intervals: Interval[] = [];  // union of all exons in the locus (minus the introns)

  exon_starts: number[] = [];
  exon_ends: number[] = [];

  graphcoords: number[] | null = null;
  graphToGene: { [key: number]: number } | null = null;

  constructor() {
    this.init();
  }

  init(): void {
    this.txs = [];
    this.ref_tx = null;
    this.seqid = null;
    this.strand = null;

    this.intervals = [];

    this.exon_starts = [];
    this.exon_ends = [];

    this.graphcoords = null;
    this.graphToGene = null;
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
    assert(this.seqid === null || this.seqid === tx.get_seqid(), "mismatching seqids: " + tx.get_tid());
    assert(this.strand === null || this.strand === tx.get_strand(), "mismatching strands: " + tx.get_tid());

    this.seqid = tx.get_seqid();
    this.strand = tx.get_strand();

    // Update intervals using list
    this.intervals = Locus.union([...this.intervals, ...tx.exons]);

    for (const pos of tx.exons) {
      this.exon_starts.push(pos[0]);
      this.exon_ends.push(pos[1]);
    }

    this.txs.push(tx);
  }

  get_start(): number {
    return this.intervals.min();
  }

  get_end(): number {
    return this.intervals.max();
  }

  getScaling(intron_scale: number, exon_scale: number, reverse_minus: boolean): [number[], { [key: number]: number }] {
    const tx_start = this.get_start();
    const tx_end = this.get_end();

    const exoncoords: number[] = new Array(tx_end - tx_start + 1).fill(0);
    for (let i = 0; i < this.exon_starts.length; i++) {
      exoncoords[this.exon_starts[i] - tx_start] = 1;
    }

    const graphToGene: { [key: number]: number } = {};
    const graphcoords: number[] = new Array(tx_end - tx_start + 1).fill(0);
    let x = 0;

    if (this.strand === '+' || !reverse_minus) {
      for (let i = 0; i < tx_end - tx_start + 1; i++) {
        graphcoords[i] = x;
        graphToGene[Math.floor(x)] = i + tx_start;

        if (exoncoords[i] === 1) {
          x += 1 / exon_scale;
        } else {
          x += 1 / intron_scale;
        }
      }
    } else {
      for (let i = 0; i < tx_end - tx_start + 1; i++) {
        graphcoords[-(i + 1)] = x;
        graphToGene[Math.floor(x)] = tx_end - i + 1;

        if (exoncoords[-(i + 1)] === 1) {
          x += 1 / exon_scale;
        } else {
          x += 1 / intron_scale;
        }
      }
    }

    return [graphcoords, graphToGene];
  }

  set_scaling(): void {
    if (this.graphcoords === null) {
      [this.graphcoords, this.graphToGene] = this.getScaling(this.settings.intron_scale, this.settings.exon_scale, this.settings.reverse);
    }

    if (this.settings.zoom) {
      const zoom_start_transform = this.settings.zoom_start - this.get_start();
      const zoom_end_transform = this.settings.zoom_end - this.get_start();
      this.zoom_ratio = !this.settings.zoom ? 1 : (zoom_end_transform - zoom_start_transform) / (this.get_end() - this.get_start());
    }
  }
}

const SashimiPlot: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    
  }, []);

  return (
    <svg ref={svgRef} width={500} height={150}>
      {/* SVG content goes here */}
    </svg>
  );
};

export default SashimiPlot;