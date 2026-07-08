export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return '发生未知错误'
}
