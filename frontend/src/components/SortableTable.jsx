export default function SortableTable({
  columns,
  rows,
  sortBy,
  dir,
  onSort,
  loading = false,
  emptyMessage = 'No records found.',
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} scope="col">
                {column.sortable ? (
                  <button type="button" className="sort-button" onClick={() => onSort(column.key)}>
                    {column.label} {sortBy === column.key ? (dir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                ) : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="empty-state" colSpan={columns.length}>Loading...</td></tr>
          ) : rows.length ? rows.map(row => (
            <tr key={row.id}>
              {columns.map(column => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          )) : (
            <tr><td className="empty-state" colSpan={columns.length}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}