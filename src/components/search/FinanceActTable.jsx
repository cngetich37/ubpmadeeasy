import { FEE_COLUMNS, rowTotal } from "../../lib/financeActs";
import { formatKES } from "../../lib/format";

const HEADERS = ["Business Description", ...FEE_COLUMNS.map(([, title]) => title), "Total"];

/** Finance Act charges for the selected activity. */
const FinanceActTable = ({ rows }) => (
  <div className="rounded-xl shadow overflow-hidden w-full overflow-x-auto">
    <table className="min-w-full divide-y divide-[#FFD700]">
      <thead className="bg-emerald-900 text-[#FFD700] sticky top-0 z-10">
        <tr>
          {HEADERS.map((header) => (
            <th
              key={header}
              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-b-2 border-[#FFD700]"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 text-black">
        {rows.map((row, index) => (
          <tr
            key={row.businessDescription}
            className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-yellow-50 transition`}
          >
            <td className="px-4 py-2 whitespace-nowrap font-medium">{row.businessDescription}</td>
            {FEE_COLUMNS.map(([field]) => (
              <td key={field} className="px-4 py-2 whitespace-nowrap">
                {formatKES(row[field]) || "KES 0.00"}
              </td>
            ))}
            <td className="px-4 py-2 whitespace-nowrap font-semibold text-emerald-900">
              {formatKES(rowTotal(row))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default FinanceActTable;
