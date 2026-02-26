interface PaginationHeadProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  baseUrl?: string;
}

export function PaginationHead({
  currentPage,
  totalPages,
  basePath,
  baseUrl = "https://subth.com",
}: PaginationHeadProps) {
  const getPageUrl = (page: number) => {
    return page === 1 ? `${baseUrl}${basePath}` : `${baseUrl}${basePath}/page/${page}`;
  };

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <>
      {prevPage && <link rel="prev" href={getPageUrl(prevPage)} />}
      {nextPage && <link rel="next" href={getPageUrl(nextPage)} />}
    </>
  );
}
