import { Building2 } from "lucide-react"
// import { useRouter } from "next/router"
// import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
// import { LoadingSpinner } from "../ui/loading-spinner"
import { Page } from "../ui/page"
import { Typography } from "../ui/typography"
import Link from "next/link"
import { Button } from "../ui/button"

export const NoOrg = () => {
    // const router = useRouter();
    return <Page
        display="flex"
        justifyContent="center"
        alignItems="center"
        background="gradient-ocean"
        padding="lg"
        className="min-h-screen"
    >
        <Card className="backdrop-blur-md max-w-md w-full">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Nicio Organizație
                </CardTitle>
                <CardDescription>
                    Nu faceți parte din nicio organizație momentan.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Typography variant="p" className="text-sm text-muted-foreground">
                    Pentru a accesa dashboard-ul, trebuie să faceți parte dintr-o
                    organizație. Contactați administratorul pentru a primi un cod de
                    invitație.
                </Typography>
                <Button asChild>
                    <Link href="/org">

                        Creați o organizație
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </Page>
}