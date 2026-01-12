export function CreateCourseValidate(
  courseName,
  imageUrl,
  price,
  duration,
  enrolled,
  status,
  badge,
  hours,
  nextId,
  recordingId
) {
  if (
    !courseName ||
    !imageUrl ||
    !price ||
    !duration ||
    !enrolled ||
    !status ||
    !badge ||
    !hours ||
    !nextId ||
    !recordingId
  ) {
    return "All fields are required!";
  }
  return null; // Explicitly return null if validation passes
}