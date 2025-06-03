import DateRangePicker from "@/components/date-range-picker";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Date Range Picker
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A powerful component for selecting date ranges with
                        infinite sliding options
                    </p>
                </div>
                <DateRangePicker />
            </div>
        </div>
    );
}
