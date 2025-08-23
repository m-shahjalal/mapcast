"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { countries, languages, timezones } from "@/utils/dropdown-list";
import { creteRssSource } from "@/server/actions/rss-feed.action";
import {
  createRssSourceSchema,
  NewRssSourceType,
} from "@/server/database/schemas";
import { newsTopicList } from "@/shared/enum-list";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignLeft,
  Clock,
  FileText,
  Globe,
  Hash,
  ImageIcon,
  Languages,
  MapPin,
  Rss,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateRssSourceForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewRssSourceType>({
    resolver: zodResolver(createRssSourceSchema) as any,
  });

  const watchedTopic = watch("topic");
  const watchedIsActive = watch("isActive");
  const watchCountry = watch("country");
  const watchLanguage = watch("language");
  const watchedTimezone = watch("timezone");

  const onSubmit = async (data: NewRssSourceType) => {
    startTransition(async () => {
      try {
        const response = await creteRssSource(data);
        if (!response.id) {
          toast.error("Failed to create RSS source. Please try again.");
          return;
        }
        toast.success("RSS source created successfully!");
        router.push("/dashboard/sources");
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Rss className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create RSS Source
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Add a new RSS source to your news aggregator. Fill in the details
            below to start collecting articles from your favorite publications.
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-500" />
              Source Information
            </CardTitle>
            <CardDescription>
              Configure the basic details for your RSS source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 font-medium"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    Source Name *
                  </Label>
                  <Input
                    id="name"
                    {...register("name", {
                      required: "Source name is required",
                    })}
                    placeholder="e.g., TechCrunch"
                    className="h-11"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="domain"
                    className="flex items-center gap-2 font-medium"
                  >
                    <Globe className="h-4 w-4 text-slate-500" />
                    Domain *
                  </Label>
                  <Input
                    id="domain"
                    {...register("baseUrl", { required: "Domain is required" })}
                    placeholder="e.g., techcrunch.com"
                    className="h-11"
                  />
                  {errors.baseUrl && (
                    <p className="text-sm text-red-600">
                      {errors.baseUrl.message}
                    </p>
                  )}
                </div>
              </div>

              {/* URLs Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="rssUrl"
                    className="flex items-center gap-2 font-medium"
                  >
                    <Rss className="h-4 w-4 text-orange-500" />
                    RSS Feed URL *
                  </Label>
                  <Input
                    id="rssUrl"
                    {...register("rssUrl", { required: "RSS URL is required" })}
                    placeholder="https://techcrunch.com/feed/"
                    className="h-11"
                  />
                  {errors.rssUrl && (
                    <p className="text-sm text-red-600">
                      {errors.rssUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="logoUrl"
                    className="flex items-center gap-2 font-medium"
                  >
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                    Logo URL (Optional)
                  </Label>
                  <Input
                    id="logoUrl"
                    {...register("logoUrl")}
                    placeholder="https://example.com/logo.png"
                    className="h-11"
                  />
                  {errors.logoUrl && (
                    <p className="text-sm text-red-600">
                      {errors.logoUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Location & Language Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  Location & Language
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="flex items-center gap-2 font-medium"
                    >
                      <MapPin className="h-4 w-4 text-slate-500" />
                      Country
                    </Label>
                    <Select
                      value={watchCountry ?? ""}
                      onValueChange={(value) => setValue("country", value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.name} value={c.code}>
                            <div className="flex items-center gap-2">
                              <div className="py-1">
                                <span className="pr-1">{c.flag}</span>
                                {c.name.charAt(0).toUpperCase() +
                                  c.name.slice(1)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="language"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Languages className="h-4 w-4 text-slate-500" />
                      Language
                    </Label>
                    <Select
                      value={watchLanguage || ""}
                      onValueChange={(value) => setValue("language", value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <div className="py-1">
                                <span className="pr-1">{c.flag}</span>
                                {c.name.charAt(0).toUpperCase() +
                                  c.name.slice(1)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.language && (
                      <p className="text-sm text-red-600">
                        {errors.language.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="timezone"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Clock className="h-4 w-4 text-slate-500" />
                      Timezone
                    </Label>
                    <Select
                      value={watchedTimezone || ""}
                      onValueChange={(value) => setValue("timezone", value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            <div className="flex items-center gap-2">
                              <div className="py-1">
                                <span className="pr-1">{tz.flag}</span>
                                {tz.name}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.timezone && (
                      <p className="text-sm text-red-600">
                        {errors.timezone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Content Classification */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-slate-500" />
                  Content Classification
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="topic"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Tag className="h-4 w-4 text-slate-500" />
                      Topic Category
                    </Label>
                    <Select
                      value={watchedTopic}
                      onValueChange={(value) => setValue("topic", value as any)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {newsTopicList.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            <div className="flex items-center gap-2">
                              <div>
                                {topic.charAt(0).toUpperCase() + topic.slice(1)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.topic && (
                      <p className="text-sm text-red-600">
                        {errors.topic.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-2 font-medium"
                    >
                      <AlignLeft className="h-4 w-4 text-slate-500" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Brief description of the news source..."
                      className="min-h-[100px] resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="keywords"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Hash className="h-4 w-4 text-slate-500" />
                      Keywords
                    </Label>
                    <Input
                      id="keywords"
                      {...register("keywords")}
                      placeholder="technology, startup, innovation (comma-separated)"
                      className="h-11"
                    />
                    {errors.keywords && (
                      <p className="text-sm text-red-600">
                        {errors.keywords.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status Section */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="isActive" className="text-base font-medium">
                    Active Status
                  </Label>
                  <p className="text-sm text-slate-600">
                    Enable this source to start collecting articles
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watchedIsActive ?? true}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Source...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Rss className="h-4 w-4" />
                      Create RSS Source
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
