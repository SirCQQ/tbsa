import {
  Typography,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Paragraph,
  Text,
  Small,
  Code,
  Lead,
  Large,
  Muted,
  Blockquote,
  GradientHeading1,
  GradientHeading2,
  GradientText,
} from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TypographyDemo() {
  return (
    <div className="space-y-8 p-6 max-w-4xl">
      <div>
        <Heading1 className="mb-4">Typography Component Demo</Heading1>
        <Lead>
          Showcase of all typography variants and their usage patterns
        </Lead>
      </div>

      {/* Basic Typography Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Variants</CardTitle>
          <CardDescription>
            Different HTML elements with their default styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Heading1>Heading 1 - Main Title</Heading1>
            <Heading2>Heading 2 - Section Title</Heading2>
            <Heading3>Heading 3 - Subsection</Heading3>
            <Heading4>Heading 4 - Minor Heading</Heading4>

            <Paragraph>
              This is a regular paragraph with proper spacing and line height.
              It demonstrates how content flows naturally with the typography
              system.
            </Paragraph>

            <Lead>
              This is a lead paragraph that stands out with larger text and
              muted color.
            </Lead>

            <Large>Large text for emphasis</Large>

            <Text>Regular inline text content</Text>

            <Small>Small text for disclaimers or metadata</Small>

            <Muted>Muted text with subdued coloring</Muted>

            <Code>const example = &quot;code snippet&quot;</Code>

            <Blockquote>
              &quot;This is a blockquote demonstrating quoted content with
              proper styling and indentation.&quot;
            </Blockquote>
          </div>
        </CardContent>
      </Card>

      {/* Custom Styling Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Styling</CardTitle>
          <CardDescription>
            Using size, weight, and className props for customization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Typography
              variant="h2"
              size="3xl"
              weight="bold"
              className="text-primary"
            >
              Custom sized and colored heading
            </Typography>

            <Typography variant="p" size="lg" weight="medium">
              Larger paragraph with medium weight
            </Typography>

            <Typography
              variant="span"
              size="sm"
              weight="light"
              className="text-muted-foreground"
            >
              Small, light span with muted color
            </Typography>

            <Typography
              variant="div"
              className="border-l-4 border-primary pl-4 py-2 bg-primary/5"
            >
              Custom div with border and background
            </Typography>
          </div>
        </CardContent>
      </Card>

      {/* Practical Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Practical Usage Examples</CardTitle>
          <CardDescription>
            Real-world usage patterns for different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Article Header */}
          <div className="space-y-3">
            <Small className="text-primary font-medium">ARTICOL</Small>
            <Heading2 className="leading-tight">
              Cum să gestionezi eficient citirile de apă în asociația de
              proprietari
            </Heading2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Text>De John Doe</Text>
              <Text>•</Text>
              <Text>15 Martie 2024</Text>
              <Text>•</Text>
              <Text>5 min citire</Text>
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-4 border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <Large>Statistici lunare</Large>
              <Small className="text-green-600 font-medium">
                +12% față de luna trecută
              </Small>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Typography
                  variant="div"
                  size="2xl"
                  weight="bold"
                  className="text-primary"
                >
                  1,234
                </Typography>
                <Muted>Citiri trimise</Muted>
              </div>
              <div className="text-center">
                <Typography
                  variant="div"
                  size="2xl"
                  weight="bold"
                  className="text-green-600"
                >
                  98%
                </Typography>
                <Muted>Rata de colectare</Muted>
              </div>
              <div className="text-center">
                <Typography
                  variant="div"
                  size="2xl"
                  weight="bold"
                  className="text-blue-600"
                >
                  24h
                </Typography>
                <Muted>Timp mediu de procesare</Muted>
              </div>
            </div>
          </div>

          {/* Form Labels */}
          <div className="space-y-4">
            <Heading3>Exemplu formular</Heading3>
            <div className="space-y-3">
              <div>
                <Typography
                  variant="small"
                  weight="medium"
                  className="block mb-1"
                >
                  Nume complet <Text className="text-red-500">*</Text>
                </Typography>
                <div className="p-2 border rounded bg-muted/30">
                  <Muted>Input field ar fi aici</Muted>
                </div>
              </div>
              <div>
                <Typography
                  variant="small"
                  weight="medium"
                  className="block mb-1"
                >
                  Email
                </Typography>
                <div className="p-2 border rounded bg-muted/30">
                  <Muted>Input field ar fi aici</Muted>
                </div>
                <Small className="text-muted-foreground mt-1 block">
                  Vom folosi email-ul pentru comunicare
                </Small>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Text Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Gradient Text</CardTitle>
          <CardDescription>
            Beautiful gradient text effects using the gradient prop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Single Color Gradients */}
          <div className="space-y-4">
            <Heading3>Single Color Gradients</Heading3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Typography variant="h3" gradient="primary">
                Primary Gradient
              </Typography>
              <Typography variant="h3" gradient="blue">
                Blue Gradient
              </Typography>
              <Typography variant="h3" gradient="green">
                Green Gradient
              </Typography>
              <Typography variant="h3" gradient="purple">
                Purple Gradient
              </Typography>
              <Typography variant="h3" gradient="cyan">
                Cyan Gradient
              </Typography>
              <Typography variant="h3" gradient="red">
                Red Gradient
              </Typography>
              <Typography variant="h3" gradient="orange">
                Orange Gradient
              </Typography>
              <Typography variant="h3" gradient="yellow">
                Yellow Gradient
              </Typography>
              <Typography variant="h3" gradient="pink">
                Pink Gradient
              </Typography>
            </div>
          </div>

          {/* Themed Gradients */}
          <div className="space-y-4">
            <Heading3>Themed Gradients</Heading3>
            <div className="space-y-3">
              <GradientHeading1 gradient="sunset">
                Sunset Gradient - Perfect for warm, welcoming headers
              </GradientHeading1>
              <GradientHeading2 gradient="ocean">
                Ocean Gradient - Cool and refreshing vibes
              </GradientHeading2>
              <Typography variant="h2" gradient="forest">
                Forest Gradient - Natural and organic feeling
              </Typography>
              <Typography variant="h2" gradient="aurora">
                Aurora Gradient - Magical and ethereal
              </Typography>
              <Typography variant="h2" gradient="twilight">
                Twilight Gradient - Mysterious and elegant
              </Typography>
              <Typography variant="h2" gradient="rainbow">
                Rainbow Gradient - Vibrant and playful
              </Typography>
            </div>
          </div>

          {/* Practical Usage */}
          <div className="space-y-4">
            <Heading3>Practical Examples</Heading3>
            <div className="space-y-6">
              {/* Hero Section Example */}
              <div className="text-center space-y-2">
                <GradientHeading1
                  gradient="aurora"
                  className="text-4xl lg:text-6xl"
                >
                  Bine ai venit la TBSA
                </GradientHeading1>
                <Typography
                  variant="p"
                  size="lg"
                  className="text-muted-foreground max-w-2xl mx-auto"
                >
                  Gestionează eficient citirile de apă pentru asociația ta cu{" "}
                  <GradientText gradient="primary">
                    soluția noastră modernă
                  </GradientText>
                </Typography>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Typography variant="h3" gradient="blue" className="mb-2">
                    Automatizare
                  </Typography>
                  <Typography
                    variant="p"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Procesare automată a citirilor
                  </Typography>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Typography variant="h3" gradient="green" className="mb-2">
                    Eficiență
                  </Typography>
                  <Typography
                    variant="p"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Economisește timp și resurse
                  </Typography>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Typography variant="h3" gradient="purple" className="mb-2">
                    Transparență
                  </Typography>
                  <Typography
                    variant="p"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    Rapoarte clare și detaliate
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            How to use the Typography component in your code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Typography variant="small" weight="medium">
              Basic usage:
            </Typography>
            <Code className="block p-3 bg-muted rounded text-sm">
              {`<Typography variant="h1">Titlu principal</Typography>\n<Typography variant="p">Paragraf de text</Typography>`}
            </Code>
          </div>

          <div className="space-y-2">
            <Typography variant="small" weight="medium">
              With gradient text:
            </Typography>
            <Code className="block p-3 bg-muted rounded text-sm">
              {`<Typography variant="h1" gradient="sunset">Gradient Title</Typography>\n<GradientText gradient="aurora">Inline gradient text</GradientText>`}
            </Code>
          </div>

          <div className="space-y-2">
            <Typography variant="small" weight="medium">
              With custom props:
            </Typography>
            <Code className="block p-3 bg-muted rounded text-sm">
              {`<Typography \n  variant="h2" \n  size="xl" \n  weight="bold" \n  gradient="ocean"\n>\n  Custom gradient heading\n</Typography>`}
            </Code>
          </div>

          <div className="space-y-2">
            <Typography variant="small" weight="medium">
              Convenience components:
            </Typography>
            <Code className="block p-3 bg-muted rounded text-sm">
              {`<GradientHeading1 gradient="primary">Gradient Title</GradientHeading1>\n<Paragraph>Regular text</Paragraph>\n<GradientText gradient="rainbow">Colorful text</GradientText>`}
            </Code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
