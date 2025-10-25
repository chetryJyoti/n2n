"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const trpc = useTRPC();
  const { data: users } = useQuery(trpc.getUsers.queryOptions());
  return (
    <div className="min-h-screen flex items-center justify-center">
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
};

export default Home;
