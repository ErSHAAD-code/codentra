import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string; // last-seen item's id; omit for the first page

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

/** Cursor pagination over offset: stays O(limit) regardless of how deep
 * into the list you are, which matters once a repository has thousands
 * of findings — offset pagination degrades linearly with page depth. */
export function buildPaginatedResult<T extends { id: string }>(items: T[], limit: number): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const lastItem = page[page.length - 1];
  return { items: page, nextCursor: hasMore && lastItem ? lastItem.id : null };
}
