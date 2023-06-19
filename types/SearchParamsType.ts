type Params = {
  id: string;
};

type SearchParams = {
  name: string;
  image: string;
  unit_amount: number | null;
  id: string;
  description: string | null;
  features: string;
};

export type SearchParamsType = {
  params: Params;
  searchParams: SearchParams;
};
