import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CreateTokenParams,
  useCreateTokenSc,
} from "@/hooks/use-create-token-sc";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface CreateTokenFormProps {
  initialValues?: Partial<CreateTokenParams>;
  onCancel: () => void;
  onSuccess: ({ tokenAddress }: { tokenAddress: string }) => void;
}

interface ExtendedCreateTokenParams extends CreateTokenParams {
  adminUsername: string;
  message?: string;
}

export const CreateTokenForm = ({
  initialValues,
  onSuccess,
  onCancel,
}: CreateTokenFormProps) => {
  const { mutateAsync: createToken, isPending: isCreatingToken } =
    useCreateTokenSc();

  const form = useForm<ExtendedCreateTokenParams>({
    defaultValues: {
      name: initialValues?.name ?? "",
      symbol: initialValues?.symbol ?? "",
      description: initialValues?.description ?? "",
      url: initialValues?.url ?? "",
      adminUsername: "",
    },
  });

  const {
    mutateAsync: createTelegramGroup,
    isPending: isCreatingTelegramGroup,
  } = useMutation({
    mutationFn: async (data: ExtendedCreateTokenParams) => {
      const response = await fetch("/api/social/telegram", {
        method: "POST",
        body: JSON.stringify({
          groupName: data.name,
          groupDescription: data.description,
          adminUsername: data.adminUsername,
          imageUrl: data.url,
          message: data.message,
        }),
      });
      return response.json();
    },
  });

  const onSubmit = async (data: ExtendedCreateTokenParams) => {
    try {
      const token = await createToken(data);
      await createTelegramGroup({
        ...data,
        message: `🚀 CA: ${token.coinType}`,
      });
      form.reset();
      onSuccess({ tokenAddress: token.coinType });
    } catch (error) {
      console.error("Error creating token:", error);
    }
  };

  return (
    <Card className="w-full p-6">
      <CardHeader>
        <CardTitle>Create Token</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter token name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter token symbol"
                      {...field}
                      maxLength={5}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-z]/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter token description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input placeholder="Enter token Image URL" {...field} />
                      {field.value && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img
                            src={field.value}
                            alt="Token preview"
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src = "";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminUsername"
              rules={{
                required: "Telegram admin username is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Admin Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Telegram username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isCreatingToken || isCreatingTelegramGroup}
              >
                {isCreatingToken && "Creating Token"}
                {isCreatingTelegramGroup && "Creating Telegram Group"}
                {!isCreatingToken && !isCreatingTelegramGroup && "Create Token"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
