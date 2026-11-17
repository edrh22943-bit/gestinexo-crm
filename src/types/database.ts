/** Generated-style Database types for Supabase clients (Fase 1). */

export type UserRole = "admin" | "vendedor";

export type OrganizationRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type BusinessRow = {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type UserRow = {
  id: string;
  auth_user_id: string;
  organization_id: string;
  business_id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRow = {
  id: string;
  organization_id: string;
  business_id: string;
  name: string;
  phone_e164: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type PipelineRow = {
  id: string;
  organization_id: string;
  business_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type PipelineStageRow = {
  id: string;
  organization_id: string;
  business_id: string;
  pipeline_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type LeadRow = {
  id: string;
  organization_id: string;
  business_id: string;
  contact_id: string;
  pipeline_id: string;
  stage_id: string;
  title: string;
  amount: number | null;
  created_at: string;
  updated_at: string;
};

type TableDef<Row, Insert = Partial<Row> & Record<string, unknown>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDef<
        OrganizationRow,
        { name: string; id?: string; created_at?: string; updated_at?: string }
      >;
      businesses: TableDef<
        BusinessRow,
        {
          organization_id: string;
          name: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      users: TableDef<
        UserRow,
        {
          auth_user_id: string;
          organization_id: string;
          business_id: string;
          role: UserRole;
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      contacts: TableDef<
        ContactRow,
        {
          organization_id: string;
          business_id: string;
          name: string;
          id?: string;
          phone_e164?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      pipelines: TableDef<
        PipelineRow,
        {
          organization_id: string;
          business_id: string;
          name: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      pipeline_stages: TableDef<
        PipelineStageRow,
        {
          organization_id: string;
          business_id: string;
          pipeline_id: string;
          name: string;
          id?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      leads: TableDef<
        LeadRow,
        {
          organization_id: string;
          business_id: string;
          contact_id: string;
          pipeline_id: string;
          stage_id: string;
          title: string;
          id?: string;
          amount?: number | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_business_member: {
        Args: { p_organization_id: string; p_business_id: string };
        Returns: boolean;
      };
      is_org_member: {
        Args: { p_organization_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
