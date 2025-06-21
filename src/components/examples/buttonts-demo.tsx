import Link from "next/link";
import { Button } from "../ui/button";

export const ButtonsDemo = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Button Variants Demo</h2>

        {/* Hero Button */}
        <Button
          asChild
          variant="gradient-primary"
          borderRadius="full"
          className="w-full mb-6"
        >
          <Link href="/auth/signin">Primary Gradient Button</Link>
        </Button>
      </div>

      {/* Basic Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Basic Variants</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Solid Color Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Solid Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="blue">Blue</Button>
          <Button variant="green">Green</Button>
          <Button variant="purple">Purple</Button>
          <Button variant="cyan">Cyan</Button>
          <Button variant="red">Red</Button>
          <Button variant="orange">Orange</Button>
          <Button variant="yellow">Yellow</Button>
          <Button variant="pink">Pink</Button>
          <Button variant="indigo">Indigo</Button>
          <Button variant="emerald">Emerald</Button>
          <Button variant="teal">Teal</Button>
          <Button variant="violet">Violet</Button>
          <Button variant="rose">Rose</Button>
          <Button variant="sky">Sky</Button>
          <Button variant="lime">Lime</Button>
          <Button variant="amber">Amber</Button>
        </div>
      </div>

      {/* Outline Color Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Outline Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="outline-blue">Outline Blue</Button>
          <Button variant="outline-green">Outline Green</Button>
          <Button variant="outline-purple">Outline Purple</Button>
          <Button variant="outline-cyan">Outline Cyan</Button>
          <Button variant="outline-red">Outline Red</Button>
          <Button variant="outline-orange">Outline Orange</Button>
          <Button variant="outline-yellow">Outline Yellow</Button>
          <Button variant="outline-pink">Outline Pink</Button>
          <Button variant="outline-indigo">Outline Indigo</Button>
          <Button variant="outline-emerald">Outline Emerald</Button>
          <Button variant="outline-teal">Outline Teal</Button>
          <Button variant="outline-violet">Outline Violet</Button>
          <Button variant="outline-rose">Outline Rose</Button>
          <Button variant="outline-sky">Outline Sky</Button>
          <Button variant="outline-lime">Outline Lime</Button>
          <Button variant="outline-amber">Outline Amber</Button>
        </div>
      </div>

      {/* Gradient Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-3">🌈 Gradient Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="gradient-primary" borderRadius="lg">
            Primary Gradient
          </Button>
          <Button variant="gradient-blue" borderRadius="lg">
            Blue Gradient
          </Button>
          <Button variant="gradient-green" borderRadius="lg">
            Green Gradient
          </Button>
          <Button variant="gradient-purple" borderRadius="lg">
            Purple Gradient
          </Button>
          <Button variant="gradient-orange" borderRadius="lg">
            Orange Gradient
          </Button>
          <Button variant="gradient-cyan" borderRadius="lg">
            Cyan Gradient
          </Button>
          <Button variant="gradient-rose" borderRadius="lg">
            Rose Gradient
          </Button>
          <Button variant="gradient-sunset" borderRadius="lg">
            Sunset Gradient
          </Button>
          <Button variant="gradient-ocean" borderRadius="lg">
            Ocean Gradient
          </Button>
          <Button variant="gradient-forest" borderRadius="lg">
            Forest Gradient
          </Button>
          <Button variant="gradient-aurora" borderRadius="lg">
            Aurora Gradient
          </Button>
          <Button variant="gradient-twilight" borderRadius="lg">
            Twilight Gradient
          </Button>
        </div>
      </div>

      {/* Glass Gradient Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          ✨ Glass Gradient Variants
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="glass-gradient-primary" borderRadius="xl">
            Glass Primary
          </Button>
          <Button variant="glass-gradient-blue" borderRadius="xl">
            Glass Blue
          </Button>
          <Button variant="glass-gradient-green" borderRadius="xl">
            Glass Green
          </Button>
          <Button variant="glass-gradient-purple" borderRadius="xl">
            Glass Purple
          </Button>
        </div>
      </div>

      {/* Size and Border Radius Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Sizes & Border Radius</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="gradient-primary" size="sm" borderRadius="none">
              Small Square
            </Button>
            <Button variant="gradient-blue" size="default" borderRadius="lg">
              Default Rounded
            </Button>
            <Button variant="gradient-green" size="lg" borderRadius="full">
              Large Full
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="glass-gradient-purple" borderRadius="xl">
              Extra Large Radius
            </Button>
            <Button variant="gradient-sunset" borderRadius="2xl">
              2XL Radius
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
