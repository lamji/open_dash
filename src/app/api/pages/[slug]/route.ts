import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface FlatComponent {
  id: string;
  pageId: string;
  parentId: string | null;
  type: string;
  config: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TreeComponent {
  id: string;
  pageId: string;
  parentId: string | null;
  type: string;
  config: Record<string, unknown>;
  order: number;
  children: TreeComponent[];
}

function buildTree(flat: FlatComponent[]): TreeComponent[] {
  const map = new Map<string, TreeComponent>();
  const roots: TreeComponent[] = [];

  for (const c of flat) {
    map.set(c.id, {
      id: c.id,
      pageId: c.pageId,
      parentId: c.parentId,
      type: c.type,
      config: JSON.parse(c.config),
      order: c.order,
      children: [],
    });
  }

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortChildren = (nodes: TreeComponent[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const n of nodes) sortChildren(n.children);
  };
  sortChildren(roots);

  return roots;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sidebarItem = await prisma.sidebarItem.findUnique({
    where: { slug },
    include: {
      page: {
        include: {
          components: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!sidebarItem?.page) {
    return NextResponse.json([], { status: 200 });
  }

  const tree = buildTree(sidebarItem.page.components as unknown as FlatComponent[]);
  return NextResponse.json(tree);
}
