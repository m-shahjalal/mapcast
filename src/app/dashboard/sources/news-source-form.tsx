"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api-client";
import { newsSourceSchema, NewsSourceSchemaType } from "@/server/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Resolver, useForm } from "react-hook-form";

interface NewsSourceFormProps {
  initialData?: NewsSourceSchemaType;
  isEditing?: boolean;
}

export function NewsSourceForm({
  initialData,
  isEditing = false,
}: NewsSourceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<NewsSourceSchemaType>({
    resolver: zodResolver(newsSourceSchema) as Resolver<NewsSourceSchemaType>,
    defaultValues: initialData ?? {
      name: "",
      domain: "",
      credibilityScore: 0,
    },
  });

  const handleSubmit = (data: NewsSourceSchemaType) => {
    startTransition(async () => {
      try {
        const response = await api.rss.create(data);
        if (response.success) router.push("/dashboard/sources");
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h2 className="text-2xl w-full text-center my-8 font-bold text-foreground">
        {isEditing ? "Edit News Source" : "Add New News Source"}
      </h2>

      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isEditing ? "Source Information" : "New Source Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter source name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rssUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSS URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/feed.xml"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter API key if required"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      API key for accessing the news source (if required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="credibilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credibility Score (0.00 - 1.00)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Rate the source's credibility from 0 to 1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Is Active?</FormLabel>
                      <FormDescription>
                        Enable or disable this news source
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isPending
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Add Source"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
