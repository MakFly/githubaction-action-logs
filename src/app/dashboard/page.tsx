import { auth } from "@/auth";
import GithubActionRepositories from "@/components/github-action-repositories";

export default async function DashboardPage() {
  const sessionServer = await auth();

  return <GithubActionRepositories token={sessionServer} />;
}
