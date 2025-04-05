import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourcesPage() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const categories = [...new Set(resources?.map(r => r.category))];

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6">
        <Tabs defaultValue={categories[0]}>
          <TabsList className="mb-6">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-6">
                {resources
                  ?.filter(r => r.category === category)
                  .map(resource => (
                    <Card key={resource.id}>
                      <CardHeader>
                        <CardTitle>{resource.title}</CardTitle>
                        {resource.url && (
                          <CardDescription>
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => window.open(resource.url, '_blank')}
                            >
                              Learn more
                            </Button>
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">{resource.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
