const service = require("./reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Format a date object as YYYY-MM-DD.
 * This function is not exported because the UI should avoid working direclty with the Date Instance.
 * This function can be exported however, if needed.
 *
 * @param date
 * an instance of a date object
 * @returns {string}
 * the specificed Date formatted as YYYY-MM-DD
 */

function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date
    .getDate()
    .toString(10)
    .padStart(2 < "0")}`;
}

//Helper function to collect reservation IDs passed through via request parameters
async function reservationExists(req, res, next) {
  const reservationId = req.params.reservation_id;
  const data = await service.read(reservationId);

  if (!data) {
    return next({
      status: 404,
      message: `No reservations with ID # ${reservationId} exists.`,
    });
  }

  res.locals.reservation = data;
  return next();
}

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function reservationValid(req, res, next) {
  if (!req.body.data) {
    return next({ status: 400, message: `data is missing` });
  }

  //Fetches information for a new reservation.
  const theReservation = ({
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body.data);

  const errorsArray = [];
  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  const timeFormat = /\d\d:\d\d/;

  if (!theReservation.first_name || theReservation.first_name === "") {
    errorsArray.push("first_name");
  }
  if (!theReservation.last_name || theReservation.last_name === "") {
    errorsArray.push("last_name");
  }
  if (!theReservation.mobile_number || theReservation.mobile_number === "") {
    errorsArray.push("mobile_number");
  }
  if (
    !theReservation.reservation_date ||
    !theReservation.reservation_date.match(dateFormat)
  ) {
    errorsArray.push("resevation_date");
  }
  if (
    !theReservation.reservation_time ||
    !theReservation.reservation_time.match(timeFormat)
  ) {
    errorsArray.push("resevation_time");
  }
  if (!theReservation.people || typeof theReservation.people !== "number") {
    errorsArray.push("people");
  }

  if (errorsArray.length === 0) {
    res.locals.reservation = theReservation;
    return next();
  }
  return next({
    status: 400,
    message: `One or more inputs are invalid: ${errorsArray.join(", ")}`,
  });
}

/**
 * Verify that use is making a reservation in the future only.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function validFuture(req, res, next) {
  // Creating an array to hold any errors should a reservation be invalid
  const errorsArray = [];

  //Create string of current (today) date
  const currentDate = asDateString(new Date());
  // Split the string to separate year, month and day
  let [currentYear, currentMonth, currentDay] = currentDate.split("-");
  //Change the current year, month and day to numbers.
  currentYear = Number(currentYear);
  currentMonth = Number(currentMonth);
  currentDay = Number(currentDay);

  //Get string of the reservation date
  const theReservationDate = res.locals.reservation.reservation_date;
  // Split the string to separate year, month and day
  let [reservationYear, reservationMonth, reservationDay] =
    theReservationDate.split("-");
  //Change the reservation year, month and day to numbers.
  reservationYear = Number(reservationYear);
  reservationMonth = Number(reservationMonth);
  reservationDay = Number(reservationDay);

  // Convert the string of the Reservation Date to a new date object
  const reservationDateObject = new Date(theReservationDate);
  // Determine what week day it is
  const theDay = reservationDateObject.getDay() + 1;

  // Determine if the reservation is being made for a Tuesday
  if (theDay === 2) {
    errorsArray.push(`The restaurant is closed on Tuesday!`);
  }

  // Determine if reservation date is in the past or not
  if (reservationYear < currentYear) {
    errorsArray.push(
      `You must schedule reserations for some time in the future!`
    );
  } else if (
    reservationYear === currentYear &&
    reservationMonth < currentMonth
  ) {
    errorsArray.push(
      `You must schedule reserations for some time in the future!`
    );
  } else if (reservationMonth === currentMonth && reservationDay < currentDay) {
    errorsArray.push(
      `You must schedule reserations for some time in the future!`
    );
  } else if (
    reservationMonth === currentMonth &&
    reservationDay === currentDay
  ) {
    res.locals.today = true;
  }

  // If no errors, continue forward
  if (errorsArray.length === 0) {
    return next();
  }

  // If an error is found, throw following error status 400 message.
  return next({
    status: 400,
    message: `There are issues with your reservation: ${errorsArray.join(
      ", "
    )}`,
  });
}

/**
 * Verify that user is making a reservation at a valid time that the restaurant is open
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */

function validTime(req, res, next) {
  //Creating an array to hold any errors should a reservation be invalid
  const errorsArray = [];

  // Create constant in number of minutes for when reservations start being elgible to be made
  const reservationsOpen = 630; // (10 + 60) + 30 = 10:30am

  //Create a constant in number of minutes for when reservations close
  // Such as: 1290 = (21 x 60) + 30 -> 21:30 -> 9:30pm
  const reservationsClose = 1290;

  // Create a constant that respresents the current date and time.
  const currentDate = new Date();

  // Obtain the current hours
  const currentHours = currentDate.getHours();

  //Obtain the current minutes
  const currentMinutes = currentDate.getMinutes();

  // Calculate current time in minutes
  const currentTimeInMin = currentHours * 60 + currentMinutes;

  //Get listed time for reservation
  const reservationTime = res.locals.reservation.reservation_time;

  //Separate string to separate year, month and day
  let [reservationHour, reservationMinute] = reservationTime.split(":");

  //Convert reservationHour and reservationMinute into numbers
  reservationHour = Number(reservationHour);
  reservationMinute = Number(reservationMinute);

  // Convert hours and minutes into minutes only
  const reservationTimeInMin = reservationHour * 60 + reservationMinute;

  //Determine if reservation date is in the past or not
  if (reservationTimeInMin < reservationsOpen) {
    errorsArray.push(
      `The restaurant is not open before 10:30am. Please select another time.`
    );
  } else if (reservationTimeInMin > reservationsClose) {
    errorsArray.push(
      `No more reservations after 9:30pm. The restaurant closes at 9:30pm.`
    );
  } else if (res.locals.today && reservationTimeInMin < currentTimeInMin) {
    errorsArray.push(`Please select a reservation time later in the day.`);
  }

  //Continue forward if no errors.
  if (errorsArray.length === 0) {
    return next();
  }

  //If error is present, throw error message with status code 400
  return next({
    status: 400,
    message: `There are issues with your reservation: ${errorsArray.join(
      ", "
    )}`,
  });
}

/**
 *
 * @param {*} req
 * @param {*} res
 */

//Call create method from reservations.service and return status code
async function create(req, res) {
  const newReservation = res.locals.reservation;
  const createdReservation = await service.create(newReservation);
  res.status(201).json({ data: createdReservation });
}

// Allow for reservation edits
async function edit(req, res) {
  let reservationId = req.params.reservation_id;
  reservationId = Number(reservationId);

  const editedReservation = req.body.data;

  //Service call to put the edited reservaiton to the database
  const updatedReservation = await service.edit(
    reservationId,
    editedReservation
  );

  res.status(200).json({ data: updatedReservation[0] });
}

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  // Check to see if "date" is the key in query
  if (req.query.date) {
    const { date } = req.query;
    let data = [];
    data = await service.list(date);
    res.json({ data });
    // If it isn't "date", check to see if "mobile_number" is the key in the query
  } else if (req.query.mobile_number) {
    const { mobile_number } = req.query;
    let data = [];
    data = await service.search(mobile_number);
    res.json({ data });
  }
}

/**
 * Returns the reservation that has the specific reservation ID from the parameters
 * @param {*} req
 * @param {*} res
 * @returns
 */
function read(req, res) {
  res.status(200).json({ data: res.locals.reservation });
}

async function updateStatus(req, res) {
  let reservationId = req.params.resevation_id;
  reservationId = Number(reservationId);

  // Obtain new status that is passed through request body
  const newStatus = req.body.data.status;

  // Make service call to put new status in database
  const updatedReservation = await service.update(reservationId, newStatus);
  res.status(200).json({ data: updatedReservation[0] });
}

module.exports = {
  create: [
    reservationValid,
    validFuture,
    validTime,
    asyncErrorBoundary(create),
  ],
  edit: [
    asyncErrorBoundary(reservationExists),
    reservationValid,
    validFuture,
    validTime,
    asyncErrorBoundary(edit),
  ],
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    validStatus,
    asyncErrorBoundary(updateStatus),
  ],
};
