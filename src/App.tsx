import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import {
  ActionFunction,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import "./App.css";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
};

type PageData = {
  total: number;
  people: Person[];
};

const globalData: Person[] = [
  {
    firstName: "Person",
    lastName: "One",
    age: 1,
  },
  {
    firstName: "Person",
    lastName: "Two",
    age: 2,
  },
  {
    firstName: "Person",
    lastName: "Three",
    age: 3,
  },
];

function parsePaginationState(params: {
  [k: string]: string;
}): PaginationState {
  return {
    pageSize: parseInt(params["pageSize"] ?? "1", 10),
    pageIndex: parseInt(params["pageIndex"] ?? "0", 10),
  };
}

export const loader: ActionFunction = ({ request }): PageData => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const { pageSize, pageIndex } = parsePaginationState(params);

  return {
    total: globalData.length,
    people: globalData.slice(
      pageIndex * pageSize,
      pageIndex * pageSize + pageSize
    ),
  };
};

function useQuerystringPagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams);

  function getPaginationState(): PaginationState {
    return parsePaginationState(params);
  }

  function setPaginationState(paginationState: PaginationState) {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      pageSize: paginationState.pageSize.toString(),
      pageIndex: paginationState.pageIndex.toString(),
    });
  }

  function onPaginationChange(updater: Updater<PaginationState>): void {
    const newPaginationState =
      typeof updater === "function" ? updater(getPaginationState()) : updater;
    setPaginationState(newPaginationState);
  }

  return { getPaginationState, onPaginationChange };
}

export function App() {
  const { total, people } = useLoaderData() as PageData;
  const { getPaginationState, onPaginationChange } = useQuerystringPagination();
  const columnHelper = createColumnHelper<Person>();

  const columns = [
    columnHelper.accessor("firstName", {
      header: "First Name",
    }),
    columnHelper.accessor("lastName", {
      header: "Last Name",
    }),
    columnHelper.accessor("age", {
      header: "Age",
    }),
  ];

  const paginationState = getPaginationState();
  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / paginationState.pageSize),
    state: {
      pagination: paginationState,
    },
    onPaginationChange,
  });

  return (
    <div className="App">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <button
          onClick={() => table.previousPage()}
          disabled={table.getState().pagination.pageIndex === 0}
        >
          &lt; Previous
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={
            table.getState().pagination.pageIndex >= table.getPageCount() - 1
          }
        >
          Next &gt;
        </button>
      </div>
      <div>
        <label htmlFor="recordsPerPage">Records per page:</label>
        <select
          id="recordsPerPage"
          onChange={(e) => table.setPageSize(parseInt(e.target.value, 10))}
        >
          <option>1</option>
          <option>2</option>
          <option>10</option>
        </select>
      </div>
    </div>
  );
}
