import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function RadioGroupUnionInt() {
  return (
    <RadioGroup defaultValue="option">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="union" id="r1" />
        <Label htmlFor="r1">Union</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="intersection" id="r2" />
        <Label htmlFor="r2">Intersection</Label>
      </div>
    </RadioGroup>
  )
}