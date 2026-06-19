import { listCourseContentForAdmin } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditCourseForm from "./edit-course-form";

type EditCoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, slug, name, tagline, description, description_detailed, price, compare_at_price, category, accent, rating, review_count, downloads, modules, included, outcomes, published",
    )
    .eq("id", id)
    .single();

  if (error || !course) {
    notFound();
  }

  const modules = await listCourseContentForAdmin(supabase, course.id);

  return <EditCourseForm course={course} existingModules={modules} />;
}
