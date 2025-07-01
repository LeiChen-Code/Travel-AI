import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const useZodForm = <TSchema extends z.ZodTypeAny>(
    props: Omit<UseFormProps<z.infer<TSchema>>, "resolver"> & {
        schema: TSchema;
    }
) => {
    const form = useForm<z.infer<TSchema>>({
        ...props,
        resolver: zodResolver(props.schema, undefined, {
            // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
            //   rawValues: ,
            raw: true,
        }),
    });

    return form;
};