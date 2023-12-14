// this function connects to the backend and returns the data from the database
export function loadDBData() {
  return new Promise<{ data: object }>((resolve) =>
  resolve({ data: {organisms : ["asdf","asqwer"]} }),
  )
}
