export interface OrgNode {
  id: number;
  name: string;
  title?: string;
  children?: OrgNode[];
}
