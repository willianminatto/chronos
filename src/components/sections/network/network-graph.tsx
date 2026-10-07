/* Everything here is in the drawing's own units: a 600 × 600 square. */

export const DRAWING = 600;

const NODES = [
  { x: 300, y: 120 },
  { x: 420, y: 200 },
  { x: 200, y: 220 },
  { x: 330, y: 290 },
  { x: 520, y: 150 },
  { x: 540, y: 290 },
  { x: 440, y: 380 },
  { x: 110, y: 150 },
  { x: 130, y: 320 },
  { x: 620, y: 230 },
  { x: 640, y: 400 },
  { x: 300, y: 480 },
  { x: 470, y: 530 },
  { x: -20, y: 240 },
  { x: 740, y: 130 },
  { x: 760, y: 330 },
  { x: 720, y: 440 },
];

interface Flow {
  /** Order in which the timeline switches traffic on. */
  group: 1 | 2 | 3;
  seconds: number;
  reverse?: boolean;
}

interface Edge {
  from: number;
  to: number;
  /** Step of the expansion in which the edge is drawn, starting at 1. */
  wave: number;
  flow?: Flow;
}

const EDGES: Edge[] = [
  { from: 0, to: 1, wave: 1 },
  { from: 0, to: 2, wave: 2, flow: { group: 1, seconds: 1.5 } },
  { from: 1, to: 3, wave: 2 },
  { from: 2, to: 3, wave: 2, flow: { group: 1, seconds: 1.9, reverse: true } },
  { from: 1, to: 4, wave: 3, flow: { group: 1, seconds: 1.3 } },
  { from: 3, to: 6, wave: 3 },
  { from: 2, to: 8, wave: 3, flow: { group: 2, seconds: 1.7 } },
  { from: 3, to: 8, wave: 3 },
  { from: 1, to: 5, wave: 3 },
  { from: 4, to: 5, wave: 4 },
  { from: 5, to: 6, wave: 4, flow: { group: 1, seconds: 2.1, reverse: true } },
  { from: 2, to: 7, wave: 4 },
  { from: 7, to: 8, wave: 4 },
  { from: 6, to: 11, wave: 4 },
  { from: 6, to: 12, wave: 4, flow: { group: 2, seconds: 1.4 } },
  { from: 4, to: 9, wave: 4, flow: { group: 2, seconds: 1.8 } },
  { from: 5, to: 9, wave: 4, flow: { group: 2, seconds: 1.6, reverse: true } },
  { from: 3, to: 11, wave: 5, flow: { group: 2, seconds: 2.2, reverse: true } },
  { from: 11, to: 12, wave: 5 },
  { from: 5, to: 10, wave: 5 },
  { from: 6, to: 10, wave: 5, flow: { group: 3, seconds: 1.5 } },
  { from: 7, to: 13, wave: 5, flow: { group: 3, seconds: 1.7 } },
  { from: 8, to: 13, wave: 5 },
  { from: 9, to: 14, wave: 5, flow: { group: 3, seconds: 1.3, reverse: true } },
  { from: 4, to: 14, wave: 5 },
  { from: 9, to: 15, wave: 5 },
  { from: 10, to: 15, wave: 5, flow: { group: 3, seconds: 2 } },
  { from: 10, to: 16, wave: 5 },
];

export const WAVES = 5;

/** Outside the 400 units that compact screens show. */
const isWide = ({ x }: { x: number }) => x < 120 || x > 480;

const edgePath = ({ from, to }: Edge) =>
  `M${NODES[from].x} ${NODES[from].y}L${NODES[to].x} ${NODES[to].y}`;

/** The step in which a node appears: when the first edge reaches it. */
const nodeWave = (index: number) =>
  Math.min(
    ...EDGES.filter((edge) => edge.from === index || edge.to === index).map(
      (edge) => edge.wave,
    ),
  );

/**
 * The Persistent Signal's way through the network: in from the top, through
 * the host and three nodes, out at the bottom.
 */
const ROUTE_NODES = [0, 1, 3, 6, 11];
const ROUTE_POINTS = [
  { x: 300, y: 0 },
  ...ROUTE_NODES.map((index) => NODES[index]),
  { x: 300, y: DRAWING },
];
const ROUTE_PATH = ROUTE_POINTS.map(
  (point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`,
).join("");

const ROUTE_LENGTHS = ROUTE_POINTS.slice(1).map((point, index) =>
  Math.hypot(point.x - ROUTE_POINTS[index].x, point.y - ROUTE_POINTS[index].y),
);
export const ROUTE_LENGTH = ROUTE_LENGTHS.reduce((sum, value) => sum + value);

/** Signal progress at each stop: the host first, then one node per wave. */
export const ROUTE_STOPS = ROUTE_LENGTHS.slice(0, -1).map(
  (_, index) =>
    ROUTE_LENGTHS.slice(0, index + 1).reduce((sum, value) => sum + value) /
    ROUTE_LENGTH,
);

const NODE = 8;
const HOST = { width: 30, height: 22 };

/** The portrait region the network converges into at the end. */
export const FRAME = { x: 215, y: 155, width: 170, height: 290 };
export const FRAME_CENTER = `${FRAME.x + FRAME.width / 2} ${FRAME.y + FRAME.height / 2}`;
/** Scale at which the network sits inside the frame. */
export const FRAME_SCALE = 0.42;
/** Far beyond any viewport: a clip that hides nothing. */
export const OPEN_CLIP = { x: -900, y: -300, width: 2400, height: 1200 };

/** Where the scaled-down route ends, to the bottom of the drawing. */
const EXIT_START = DRAWING / 2 + (DRAWING / 2) * FRAME_SCALE;
const EXIT_PATH = `M300 ${EXIT_START}V${DRAWING}`;

interface NetworkGraphProps {
  /** Unique per instance: namespaces the SVG ids. */
  id: string;
  /** Whether traffic is showing. The timeline may switch it on later. */
  flow: "on" | "off";
}

/** Decorative. One SVG: edges, traffic, nodes and the signal's route. */
export function NetworkGraph({ id, flow }: NetworkGraphProps) {
  const clipId = `${id}-clip`;

  return (
    <svg
      data-network="graph"
      data-signal-pending
      data-flow={flow}
      className="network-graph"
      viewBox={`0 0 ${DRAWING} ${DRAWING}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect data-network="clip" {...OPEN_CLIP} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <g data-network="field">
          {EDGES.map((edge) => (
            <path
              key={`${edge.from}-${edge.to}`}
              data-network="edge"
              data-wave={edge.wave}
              className={`network-edge ${
                isWide(NODES[edge.from]) || isWide(NODES[edge.to])
                  ? "network-wide"
                  : ""
              }`}
              pathLength={1}
              d={edgePath(edge)}
            />
          ))}
          {EDGES.map((edge) =>
            edge.flow ? (
              <path
                key={`${edge.from}-${edge.to}`}
                data-flow-group={edge.flow.group}
                className={`network-flow ${
                  isWide(NODES[edge.from]) || isWide(NODES[edge.to])
                    ? "network-wide"
                    : ""
                }`}
                pathLength={1}
                d={edgePath(edge)}
                style={{
                  "--network-flow-seconds": `${edge.flow.seconds}s`,
                  "--network-flow-direction": edge.flow.reverse
                    ? "reverse"
                    : "normal",
                }}
              />
            ) : null,
          )}

          <path className="network-route" pathLength={1} d={ROUTE_PATH} />
          <path className="network-route-flow" pathLength={1} d={ROUTE_PATH} />

          {NODES.map((node, index) =>
            index === 0 ? (
              <rect
                key="host"
                className="network-node"
                x={node.x - HOST.width / 2}
                y={node.y - HOST.height / 2}
                {...HOST}
              />
            ) : (
              <rect
                key={`${node.x}-${node.y}`}
                data-network="node"
                data-wave={nodeWave(index)}
                className={`network-node ${isWide(node) ? "network-wide" : ""}`}
                x={node.x - NODE / 2}
                y={node.y - NODE / 2}
                width={NODE}
                height={NODE}
              />
            ),
          )}
          <text className="network-label" x={NODES[0].x + 24} y={NODES[0].y + 3}>
            HOST
          </text>
          <text
            data-network="node"
            data-wave={1}
            className="network-label"
            x={NODES[1].x + 12}
            y={NODES[1].y + 3}
          >
            NODE
          </text>

          <rect
            data-signal-head
            className="network-head"
            x={-3}
            y={-3}
            width={6}
            height={6}
            style={{ offsetPath: `path("${ROUTE_PATH}")` }}
          />
        </g>
      </g>

      <rect
        data-network="frame"
        className="network-frame"
        pathLength={1}
        rx={12}
        {...FRAME}
      />
      <path
        data-network="exit"
        className="network-exit"
        pathLength={1}
        d={EXIT_PATH}
      />
      <rect
        data-network="exit"
        className="network-exit-head"
        x={-3}
        y={-3}
        width={6}
        height={6}
        style={{ offsetPath: `path("${EXIT_PATH}")` }}
      />
    </svg>
  );
}
