import { Fragment, Key, ReactElement, useMemo } from "react";
import Image from "next/image";
import Pagination from "./pagination";
import ComponentLoading from "@/ui/component-loading";

export interface ColumnType<T> {
  title: ReactElement;
  key: Key;
  dataIndex?: keyof T;
  width?: string | number;
  align?: "left" | "center" | "right"; // TODO
  render?: (row: T) => ReactElement;
}

interface Props<T> {
  dataSource: T[];
  columns: ColumnType<T>[];
  loading?: boolean;
  onRowClick?: (key: Key, row: T) => void;

  // pagination
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function Table<T extends { key: Key }>({
  total,
  columns,
  loading,
  dataSource,
  pageSize,
  currentPage,
  onRowClick,
  onPageChange,
}: Props<T>) {
  const templateCols = useMemo(
    () =>
      columns.reduce((acc, cur) => {
        const width =
          typeof cur.width === "string" ? cur.width : typeof cur.width === "number" ? `${cur.width}px` : "1fr";
        if (acc === "auto") {
          acc = width;
        } else {
          acc = `${acc} ${width}`;
        }
        return acc;
      }, "auto"),
    [columns],
  );

  return (
    <div className="min-w-[56rem] overflow-x-auto">
      {/* header */}
      <div
        className="grid items-center gap-middle rounded-t-middle bg-component px-middle py-large text-sm font-extrabold text-white lg:px-large"
        style={{ gridTemplateColumns: templateCols }}
      >
        {columns.map(({ key, title }) => (
          <Fragment key={key}>{title}</Fragment>
        ))}
      </div>

      {/* body */}
      <div className="relative">
        {/* loading */}
        <ComponentLoading loading={!!loading} className="rounded-b-middle" />

        {/* content */}
        {dataSource.length ? (
          <div className="">
            {/* data source */}
            <div className="mb-middle rounded-b-middle bg-inner">
              {dataSource.map((row) => (
                <div
                  key={row.key}
                  className={`grid items-center gap-middle border-t border-t-white/10 p-middle text-sm font-medium transition-colors lg:px-large ${
                    onRowClick ? "hover:cursor-pointer hover:bg-white/5" : ""
                  }`}
                  style={{ gridTemplateColumns: templateCols }}
                  onClick={() => onRowClick && onRowClick(row.key, row)}
                >
                  {columns.map(({ key, dataIndex, render }) => (
                    <Fragment key={key}>
                      {render ? (
                        render(row)
                      ) : dataIndex ? (
                        <span className="truncate">{`${row[dataIndex]}`}</span>
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>

            {/* pagination */}
            {total !== undefined && currentPage !== undefined && (
              <Pagination total={total} pageSize={pageSize} currentPage={currentPage} onChange={onPageChange} />
            )}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-large">
            {!loading && (
              <>
                <Image width={50} height={63} alt="No data" src="/images/no-data.svg" />
                <span className="text-sm font-medium text-white/50">No data</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
