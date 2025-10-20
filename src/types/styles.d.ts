// Type declarations for importing LESS files
declare module "*.less" {
  const content: string;
  export default content;
}

// Type declarations for importing CSS files
declare module "*.css" {
  const content: string;
  export default content;
}