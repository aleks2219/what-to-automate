// Adapter that re-exports tools from tools-db.ts plus industries from automation.ts.
// Used by components that need both tool data and industry list.

export { TOOLS, Tool, ToolCategory, Capability, getToolById, getToolsByIds } from './tools-db';
export { INDUSTRIES, Industry } from './automation';
