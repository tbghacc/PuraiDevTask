import Skeleton from "./skeleton";

type TableSkeletonProps = {
  rows?: number;
  idWidth: number;
  longestModel: number;
};

const thCls = "text-left bg-sky-500 border py-4 px-2 whitespace-nowrap";
const tdCls = "text-left bg-sky-300 border py-4 px-2";

export default function TableSkeleton({
  rows = 10,
  idWidth,
  longestModel,
}: TableSkeletonProps) {
  return (
    <table className="w-full border-collapse table-fixed border-2">
      <thead>
        <tr>
          <th className={thCls} style={{ width: `${idWidth}ch` }}>
            <Skeleton variant="sky-dark" className="h-4 w-12" />
          </th>
          <th className={thCls} style={{ width: "25%" }}>
            <Skeleton variant="sky-dark" className="h-4 w-16" />
          </th>
          <th className={thCls} style={{ width: `${Math.max(longestModel + 2, 8)}ch` }}>
            <Skeleton variant="sky-dark" className="h-4 w-14" />
          </th>
          <th className={thCls} style={{ width: "11ch" }}>
            <Skeleton variant="sky-dark" className="h-4 w-20" />
          </th>
          <th className={thCls} style={{ width: "10ch" }}>
            <Skeleton variant="sky-dark" className="h-4 w-16" />
          </th>
          <th className={thCls} style={{ width: "11ch" }}>
            <Skeleton variant="sky-dark" className="h-4 w-20" />
          </th>
          <th className={thCls} style={{ width: "25%" }}>
            <Skeleton variant="sky-dark" className="h-4 w-24" />
          </th>
          <th className={thCls} style={{ width: "22%" }}>
            <Skeleton variant="sky-dark" className="h-4 w-28" />
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-10" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-full" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-16" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-8" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-6" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-12" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-3/4" /></td>
            <td className={tdCls}><Skeleton variant="sky-light" className="h-4 w-20" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}