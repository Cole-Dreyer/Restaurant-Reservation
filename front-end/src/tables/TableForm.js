import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

//Import createTable function from api
import { createTable } from "../utils/api";

function TableForm({
  editTableName = "",
  editCapaciy = "",
  editId = "",
  isNew,
}) {
  //error handling useState
  const [error, setError] = useState(null);

  //useState for table fields
  const [table, SetTable] = useState({
    table_name: "",
    capacity: "",
  });

  const history = useHistory();

  //Event handler for when creating a table
  const handleCreateSubmit = async function (event) {
    event.preventDefault();
    const abortController = new AbortController();
    try {
      await createTable(table, abortController.signal);
      history.push(`/dashbaord`);
    } catch (error) {
      setError(error);
      return () => abortController.abort();
    }
  };

  //Handler for when changes to fields occur
  const handleChange = ({ target }) => {
    SetTable({
      ...table,
      [target.name]:
        target.name === "capacity" ? Number(target.value) : target.value,
    });
  };

  // HTML to be returned
  return (
    <div>
      <ErrorAlert error={error} />
      <form
        /* Determine which event handler to use when form is submitted */
        onSubmit={handleCreateSubmit}
      >
        <table>
          <thead>
            <tr>
              <th colspan="2">
                <h1>Make a Table</h1>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Table row for labels */}
            <tr>
              <td>
                <label>Table Name</label>
              </td>
              <td>
                <label>Table Capacity</label>
              </td>
            </tr>
            {/* Table row for inputs */}
            <tr>
              <td>
                <input
                  id="tableName"
                  type="text"
                  name="table_name"
                  onChange={handleChange}
                  value={table.table_name}
                />
              </td>
              <td>
                <input
                  id="tableCapacity"
                  name="capacity"
                  onChange={handleChange}
                  value={table.capacity}
                />
              </td>
            </tr>
            {/* Empty Table Row to separate inputs and buttons */}
            <tr>
              <td>
                <br />
              </td>
            </tr>
            {/* Table row for buttons */}
            <tr>
              <td>
                <button className="btn btn-primary ml-2" type="submit">
                  Submit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-secondary"
                  /* On Click, use anonymous event handlerto go back one page in history */
                  onClick={(e) => {
                    e.preventDefault();
                    history.go(-1);
                  }}
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>{" "}
      {/* End of Form for modifying or creating a table */}
    </div>
  );
}

export default TableForm;
