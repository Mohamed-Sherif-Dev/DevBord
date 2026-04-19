import { NextResponse } from "next/server"

export function successResponse<T>(data: T, message = "Success", status = 200, meta?: any) {
  return NextResponse.json({ success: true, message, data, ...(meta && { meta }) }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

export function paginationMeta(total: number, page: number, limit: number) {
  return { total, page, limit, pages: Math.ceil(total / limit) }
}