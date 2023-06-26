export enum TaskStatuses {
  New = 0,
  InProgress = 1,
  Completed = 2,
  Draft = 3,
}

export enum TaskPriorities {
  Low = 0,
  Middle = 1,
  Hi = 2,
  Urgently = 3,
  Later = 4,
}

// export enum ResultCode {
//     Success = 0,
//     Error = 1,
//     Captcha = 10,
// } Для красоты повторяющихся магических чисел, можно использовать enum, но предпочтительнее использовать объект, и для того, чтобы он не изменялся, применять свойство as const

export const ResultCode = {
  Success: 0,
  Error: 1,
  Captcha: 10,
} as const;
