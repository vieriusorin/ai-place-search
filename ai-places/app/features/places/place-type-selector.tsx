"use client";

import { UtensilsCrossed, Car, Building2, ChevronDown } from "lucide-react";

import { PlaceType } from "@/types/places";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlaceTypeSelectorProps {
	selectedType: PlaceType;
	onTypeChange: (type: PlaceType) => void;
	className?: string;
}

const placeTypeConfig = {
	[PlaceType.RESTAURANTS]: {
		label: "Restaurants",
		icon: UtensilsCrossed,
		description: "Find great dining spots",
		color: "text-orange-600",
		bgColor: "bg-orange-50",
		borderColor: "border-orange-200",
		selectedBg: "bg-orange-100",
		selectedBorder: "border-orange-500",
	},
	[PlaceType.PARKINGS]: {
		label: "Parking",
		icon: Car,
		description: "Find parking spaces",
		color: "text-blue-600",
		bgColor: "bg-blue-50",
		borderColor: "border-blue-200",
		selectedBg: "bg-blue-100",
		selectedBorder: "border-blue-500",
	},
	[PlaceType.HOTELS]: {
		label: "Hotels",
		icon: Building2,
		description: "Find accommodations",
		color: "text-purple-600",
		bgColor: "bg-purple-50",
		borderColor: "border-purple-200",
		selectedBg: "bg-purple-100",
		selectedBorder: "border-purple-500",
	},
};

export function PlaceTypeSelector({
	selectedType,
	onTypeChange,
	className,
}: PlaceTypeSelectorProps): JSX.Element {
	const selectedConfig = placeTypeConfig[selectedType];
	const SelectedIcon = selectedConfig.icon;

	return (
		<div className={cn("space-y-2", className)}>
			<label className='text-sm font-medium'>What are you looking for?</label>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className={cn(
						"flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm w-full",
						`${selectedConfig.selectedBg} ${selectedConfig.selectedBorder} shadow-sm`
					)}>
						<div className="flex items-center gap-3">
							<div className={cn(
								"flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm"
							)}>
								<SelectedIcon className={cn("h-5 w-5", selectedConfig.color)} />
							</div>

							<div className='flex-1'>
								<h3 className={cn("font-medium", selectedConfig.color)}>
									{selectedConfig.label}
								</h3>
								<p className='text-sm text-muted-foreground'>
									{selectedConfig.description}
								</p>
							</div>
						</div>

						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-full min-w-[300px]">
					{Object.entries(placeTypeConfig).map(([type, config]) => {
						const isSelected = selectedType === type;
						const Icon = config.icon;

						return (
							<DropdownMenuItem
								key={type}
								onClick={() => onTypeChange(type as PlaceType)}
								className={cn(
									"flex items-center gap-3 cursor-pointer p-3",
									isSelected && "bg-accent"
								)}
							>
								<div className={cn(
									"flex h-8 w-8 items-center justify-center rounded-lg",
									isSelected ? "bg-white shadow-sm" : "bg-white/50"
								)}>
									<Icon className={cn(
										"h-4 w-4",
										isSelected ? config.color : "text-muted-foreground"
									)} />
								</div>

								<div className='flex-1'>
									<h3 className={cn(
										"font-medium text-sm",
										isSelected ? config.color : "text-foreground"
									)}>
										{config.label}
									</h3>
									<p className='text-xs text-muted-foreground'>
										{config.description}
									</p>
								</div>

								{isSelected && (
									<div className={cn(
										"h-2 w-2 rounded-full",
										config.color.replace("text-", "bg-")
									)} />
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Quick Stats */}
			<div className='mt-3 text-xs text-muted-foreground'>
				<p>✨ Results include AI-powered quality analysis</p>
				<p>📍 Showing top 10 places based on ratings and distance</p>
			</div>
		</div>
	);
}
