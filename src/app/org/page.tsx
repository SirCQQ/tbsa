import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Form } from "@/components/ui/form";
import { Page } from "@/components/ui/page";
// import { Typography } from "@/components/ui/typography";
// import { useForm } from "react-hook-form";

const CreateOrgPage = () => {
    // const form = useForm({
    //     defaultValues: {
    //         name: "",
    //         description: "",

    //     }
    // })
    return <Page
        display="flex"
        justifyContent="center"
        alignItems="center"
        background="gradient-ocean"
        className="min-h-screen"
    >
        <Card>
            <CardHeader>Create OrganizationCardHeader

            </CardHeader>
            <CardContent>
                {/* <Form> */}

                {/* </Form> */}
            </CardContent>
        </Card>
    </Page>
};

export default CreateOrgPage;