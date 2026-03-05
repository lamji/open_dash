import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const WIDGET_GENERATOR_PROMPT = `You are a React/Next.js component generator specializing in shadcn/ui components.

AVAILABLE SHADCN COMPONENTS:
- Button (variants: default, destructive, outline, secondary, ghost, link)
- Card (with CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Badge (variants: default, secondary, destructive, outline)
- Input (types: text, email, password, number, search, tel, url)
- Label
- Textarea
- Select (with SelectTrigger, SelectValue, SelectContent, SelectItem)
- Separator
- Progress
- Accordion (with AccordionItem, AccordionTrigger, AccordionContent)
- Alert (with AlertTitle, AlertDescription)
- Dialog (with DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter)
- DropdownMenu (with DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator)
- Tabs (with TabsList, TabsTrigger, TabsContent)
- Table (with TableHeader, TableBody, TableRow, TableHead, TableCell)
- Avatar (with AvatarImage, AvatarFallback)
- Breadcrumb (with BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator)
- Calendar
- Popover (with PopoverTrigger, PopoverContent)
- RadioGroup (with RadioGroupItem)
- Checkbox
- ScrollArea

AVAILABLE LUCIDE ICONS (import from "lucide-react"):
Heart, Star, ShoppingCart, User, Search, Bell, Menu, X, ChevronDown, ChevronUp, Plus, Minus, Check, Trash, Edit, Settings, Home, Mail, Phone, MapPin, Calendar, Clock, Download, Upload, Share, Filter, etc.

STYLING GUIDELINES:
1. Use Tailwind CSS classes for all styling
2. Follow shadcn/ui design patterns (clean, modern, accessible)
3. Use semantic color classes (text-muted-foreground, bg-card, border-border, etc.)
4. Ensure proper spacing with gap-*, p-*, m-* utilities
5. Make components responsive with sm:, md:, lg: breakpoints
6. Use flexbox (flex, flex-col, items-center, justify-between) for layouts
7. Add hover states (hover:bg-accent, hover:text-accent-foreground)

COMPONENT STRUCTURE RULES:
1. Always include proper imports at the top
2. Export a default function component
3. Use TypeScript with proper typing
4. Include data-test-id attributes on interactive elements
5. Make components self-contained and reusable
6. Use const for component definitions
7. Add helpful comments for complex logic

RESPONSE FORMAT:
1. Return ONLY the complete JSX component code
2. Wrap code in markdown code fence with "tsx" language identifier
3. Include all necessary imports
4. Make the component immediately usable (no placeholders)
5. Add realistic sample data where needed

EXAMPLES:

User: "create me a product card"
Response:
\`\`\`tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";

export default function ProductCard() {
  return (
    <Card className="relative w-full max-w-sm">
      <Badge className="absolute top-2 left-2 bg-red-500">25% OFF</Badge>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        data-test-id="wishlist-btn"
      >
        <Heart className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-6">
        <img
          src="/placeholder-product.jpg"
          alt="Product"
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        
        <h3 className="text-lg font-semibold mb-2">Premium Wireless Headphones</h3>
        
        <div className="flex gap-2 mb-3">
          <span className="text-muted-foreground line-through">$199.99</span>
          <span className="text-red-500 font-bold">$149.99</span>
        </div>
        
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <div className="flex gap-2 mb-3">
          {["Black", "White", "Blue", "Red"].map((color) => (
            <Badge key={color} variant="outline" data-test-id={\`color-\${color.toLowerCase()}\`}>
              {color}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2 mb-4">
          {["S", "M", "L", "XL"].map((size) => (
            <Button key={size} variant="outline" size="sm" data-test-id={\`size-\${size}\`}>
              {size}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="icon" data-test-id="qty-decrease">
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value="1"
            className="w-16 text-center border rounded px-2 py-1"
            data-test-id="qty-input"
          />
          <Button variant="outline" size="icon" data-test-id="qty-increase">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" data-test-id="add-to-cart-btn">
          Add to Cart
        </Button>
        <p className="text-sm text-green-500">In Stock</p>
      </CardFooter>
    </Card>
  );
}
\`\`\`

Now generate a complete, production-ready component based on the user's request.`;

export async function POST(req: Request) {
  console.log(`Debug flow: POST /api/ai/widget fired with`, { timestamp: new Date().toISOString() });

  try {
    const authResult = await getProjectContext(req);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { projectId } = authResult;
    const body = await req.json();
    const { message } = body;

    console.log(`Debug flow: Widget generation request`, { projectId, message });

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Call Groq AI to generate the widget
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: WIDGET_GENERATOR_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const generatedCode = completion.choices[0]?.message?.content || "";

    console.log(`Debug flow: Widget generated`, { 
      codeLength: generatedCode.length,
      hasCodeFence: generatedCode.includes("```")
    });

    // Return the generated code as a chat message
    return NextResponse.json({
      message: generatedCode,
      role: "assistant",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Widget generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate widget",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
