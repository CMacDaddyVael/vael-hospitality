export type MewsCredentials = {
  client_token: string;
  access_token: string;
  platform_url?: string;
};

export type MewsCustomer = {
  Id: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  NationalityCode?: string;
  LanguageCode?: string;
  UpdatedUtc: string;
};

export type MewsReservation = {
  Id: string;
  CustomerId: string;
  State: "Confirmed" | "Started" | "Processed" | "Canceled" | "Optional";
  StartUtc: string;
  EndUtc: string;
  RequestedResourceCategoryId?: string;
  AssignedResourceId?: string;
  RateId?: string;
  TotalAmount?: { Value: number; Currency: string };
  AdultCount?: number;
  ChildCount?: number;
  Origin?: string;
  Notes?: string;
  UpdatedUtc: string;
};
