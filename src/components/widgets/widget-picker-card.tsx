'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { WidgetTemplate } from '@/presentation/widgets/useWidgets';
import { WIDGET_PREVIEWS } from '@/presentation/widgets';

interface WidgetPickerCardProps {
  templates: WidgetTemplate[];
  onSelect: (template: WidgetTemplate) => void;
}

/**
 * Widget Picker Card Component
 * Displays widget templates in a professional card grid using shadcn/ui Card component
 * Shows only widgets with actual preview functions
 */
export const WidgetPickerCard = ({ templates, onSelect }: WidgetPickerCardProps) => {
  console.log('Debug flow: WidgetPickerCard fired with', { templateCount: templates.length });
  const availableTemplates = templates.filter((template) => WIDGET_PREVIEWS[template.slug]);

  if (availableTemplates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
        <p className="text-slate-500 text-sm">No widgets available for this category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 w-full">
      {availableTemplates.map((template) => {
        // Detect if this is a table widget
        const isTableWidget = template.slug.includes("table");

        return (
          <div
            key={template.slug}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log('Debug flow: WidgetPickerCard onClick fired with', { slug: template.slug });
              onSelect(template);
            }}
            onKeyDown={(event) => {
              console.log('Debug flow: WidgetPickerCard onKeyDown fired with', { slug: template.slug, key: event.key });
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(template);
              }
            }}
            className="text-left transition-all duration-200 hover:shadow-xl hover:scale-102 active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            title={template.title}
            data-test-id={`widget-picker-card-${template.slug}`}
          >
            <Card className="w-80 h-80 border-2 border-slate-200 hover:border-blue-400 cursor-pointer overflow-hidden flex flex-col">
              {/* Preview Section - Full Card */}
              <CardContent className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 flex-1 overflow-hidden">
                {WIDGET_PREVIEWS[template.slug] ? (
                  <div className="w-full h-full">
                    {isTableWidget
                      ? WIDGET_PREVIEWS[template.slug]({ ...template.widgetData, _preview: true })
                      : WIDGET_PREVIEWS[template.slug](template.widgetData ?? {})}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Preview unavailable</p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default WidgetPickerCard;
