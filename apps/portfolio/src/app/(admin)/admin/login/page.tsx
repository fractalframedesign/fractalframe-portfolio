import { Lock } from "lucide-react";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Lock className="text-muted-foreground size-5" aria-hidden />
          <CardTitle>
            <h1 className="text-lg font-semibold">Admin</h1>
          </CardTitle>
          <CardDescription>
            Enter the admin password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
