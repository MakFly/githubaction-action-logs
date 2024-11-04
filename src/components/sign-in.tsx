import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

function GitHubLogin() {
  return (
    <Card className="w-[350px] mx-auto mt-20">
      <CardHeader>
        <CardTitle>Connexion GitHub</CardTitle>
        <CardDescription>
          Connectez-vous pour voir vos workflows GitHub Actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <Button className="w-full" variant="outline" type="submit">
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
            Se connecter avec GitHub
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SignIn() {
  return <GitHubLogin />;
}
