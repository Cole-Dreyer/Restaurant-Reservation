import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation, editReservation } from "../utils/api";

import ErrorAlert from "../layout/ErrorAlert.js";

function ReservationForm({ props }) {
  const isNew = props.isNew;

  // UseState for Error Handling
  const [error, setError] = useState(null);

  //Empty reservation form object to pass passedReservation into
  const [reservation, setReservation] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });

  const history = useHistory();

  useEffect(() => {
    if (!isNew && props.passedReservation.first_name) {
      setReservation(props.passedReservation);
    }
  }, [isNew, props.passedReservation]);

  //Event handler for creating a new reservation

  const handleSubmit = async function (event) {
    event.preventDefault();
    const abortController = new AbortController();
    try {
      // If isNew is true, then call createReservation
      if (isNew) {
        let result = await createReservation(
          reservation,
          abortController.signal
        );
        let reservationDate = result.reservation_date;
        history.push(`/dashboard?date=${reservationDate}`);
      } else {
        // If isNew is false, then editReservation should be called.
        let result = await editReservation(reservation, abortController.signal);
        let reservationDate = result.reservation_date;
        await props.loadReservation();
        history.push(`/dashboard?date=${reservationDate}`);
      }
    } catch (error) {
      setError(error);
      return () => abortController.abort();
    }
  };
  /**
   * Handler for various field changes
   * @param {*} param0
   */
  const handleChange = ({ target }) => {
    setReservation({
      ...reservation,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  };

  //HTML to return for form
  return (
    <div>
      <ErrorAlert error={error} />
      {/* Determine which event handler to use when the form is submitted */}
      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th colspan="2">
                {isNew ? (
                  <h1>Make a Reservation</h1>
                ) : (
                  <h1>Edit a Reservation</h1>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Table row for fist_name and last_name input labels */}
            <tr>
              <td>
                <label>First Name</label>
              </td>
              <td>
                <label>Last Name</label>
              </td>
            </tr>
            {/* table row for first_name and last_name inputs */}
            <tr>
              <td>
                <input
                  id="firstName"
                  name="first_name"
                  onChange={handleChange}
                  type="text"
                  value={reservation.first_name}
                />
              </td>
              <td>
                <input
                  id="lastName"
                  name="last_name"
                  onChange={handleChange}
                  type="text"
                  value={reservation.flast_name}
                />
              </td>
            </tr>
            {/* Table rows for mobile_number and people input labels */}
            <tr>
              <td>
                <input
                  id="mobileNumber"
                  name="mobile_number"
                  onChange={handleChange}
                  value={reservation.mobile_number}
                />
              </td>
              <td>
                <input
                  id="partyPeople"
                  name="people"
                  onChange={handleChange}
                  value={reservation.people}
                />
              </td>
            </tr>
            {/* Table row for date and time labels */}
            <tr>
              <td>
                <label>Date of Reservation</label>
              </td>
              <td>
                <label>Time of Reservation</label>
              </td>
            </tr>
            {/* Table row for date and time inputs */}
            <tr>
              <td>
                <input
                  id="reservationDate"
                  type="date"
                  name="reservation_date"
                  onChange={handleChange}
                  value={reservation.reservation_date}
                  placeholder="YYYY-MM-DD"
                  pattern="\d{4}-\d{2}-\d{2}"
                />
              </td>
            </tr>
            {/* Table row that is empty to provide space between inputs and buttons */}
            <tr>
              <td>
                <br />
              </td>
            </tr>
            {/* Table Row for buttons */}
            <tr>
              <td>
                <button className="btn btn-primary ml-2" type="submit">
                  Submit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-secondary"
                  /* on click, uuse anonymous event handler to go back one page in history */
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
      {/* Reservation from end for editing and creating reservation */}
    </div>
  );
}

export default ReservationForm;
