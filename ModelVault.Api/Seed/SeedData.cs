namespace ModelVault.Api.Seed;

public static class SeedData
{
    private static readonly Random Rng = new(42);

    private static readonly string[] Authors =
        ["Alex Rivera", "Sam Chen", "Jordan Lee", "Morgan Taylor", "Casey Novak", "Riley Park", "Quinn Foster"];

    public static List<SeedModel> GetModels() =>
    [
        M("Articulated Dragon", "A fully articulated dragon with snap-fit joints. Print-in-place, no supports needed.", "Toys & Games", ["Featured", "Print-in-Place"], 1842, 312),
        M("Gear Bearing", "Planetary gear bearing that spins freely after printing. Great desk fidget.", "Mechanical", ["Print-in-Place", "Parametric"], 2103, 445),
        M("Miniature Castle", "Detailed medieval castle for tabletop RPGs. Modular walls and towers.", "Miniatures", ["Featured"], 967, 201),
        M("Phone Stand - Adjustable", "Adjustable phone stand with cable routing. Fits all phone sizes.", "Gadgets", ["Customizable"], 3201, 578),
        M("Periodic Table Display", "Wall-mounted periodic table with slots for element samples.", "Education", ["Featured"], 1456, 298),
        M("Succulent Planter Set", "Set of 5 geometric planters with drainage holes.", "Household", ["Customizable"], 2890, 502),
        M("Topology Sculpture - Möbius", "Mathematical Möbius strip sculpture for educational display.", "Art", ["Featured"], 654, 189),
        M("Socket Organizer Tray", "Customizable socket wrench organizer. Parametric design.", "Tools", ["Parametric", "Customizable"], 1789, 334),
        M("Flexi Rex", "Flexible T-Rex toy, prints in one piece. Kid-friendly.", "Toys & Games", ["Print-in-Place", "Featured"], 4521, 890),
        M("DNA Double Helix Model", "Accurate DNA model for biology class demonstrations.", "Education", ["Featured"], 1234, 267),
        M("Cable Management Clips", "Adhesive-backed cable clips in various sizes.", "Household", [], 3456, 412),
        M("Steampunk Lamp Base", "Ornate steampunk-style lamp base. Requires E27 socket kit.", "Art", ["Featured"], 876, 234),
        M("Planetary Gear Set", "Working planetary gear train for engineering demonstrations.", "Mechanical", ["Parametric"], 1567, 356),
        M("Hex Bit Holder", "Wall-mounted hex bit organizer. Holds 30 standard bits.", "Tools", ["Customizable"], 2345, 467),
        M("Chess Set - Modern", "Complete modern-style chess set with storage board.", "Toys & Games", ["Featured"], 1678, 389),
        M("Anatomical Heart Model", "Cross-section heart model with removable parts.", "Education", [], 987, 212),
        M("Desk Organizer - Modular", "Stackable modular desk organizer system.", "Household", ["Customizable", "Parametric"], 2567, 534),
        M("Voronoi Vase", "Voronoi-pattern decorative vase. Watertight with inner shell.", "Art", ["Parametric"], 1345, 298),
        M("Miniature Dungeon Tiles", "Modular dungeon tiles for D&D. 2x2 inch grid system.", "Miniatures", ["Customizable"], 2890, 567),
        M("Caliper Holder", "Wall-mounted digital caliper holder with tool slot.", "Tools", [], 1123, 198),
        M("Marble Run Modules", "Modular marble run system. 15 different track pieces.", "Toys & Games", ["Print-in-Place"], 3678, 723),
        M("Solar System Model", "Scale model of the solar system on a display stand.", "Education", ["Featured"], 1890, 412),
        M("Headphone Hook", "Under-desk headphone hook. Strong snap-fit mount.", "Gadgets", [], 4123, 678),
        M("Kinetic Wind Spinner", "Garden wind spinner with balanced bearing mount.", "Art", ["Print-in-Place"], 1456, 312),
        M("Geneva Drive Mechanism", "Working Geneva drive for mechanism demonstrations.", "Mechanical", ["Featured", "Parametric"], 876, 198),
    ];

    private static SeedModel M(string title, string desc, string category, string[] tags, int downloads, int likes) => new()
    {
        Title = title,
        Description = desc,
        Category = category,
        Tags = tags.ToList(),
        ThumbnailPath = $"https://picsum.photos/seed/{title.GetHashCode():x}/640/400",
        FilePath = "",
        AuthorId = $"seed-{Rng.Next(1, 100)}",
        AuthorName = Authors[Rng.Next(Authors.Length)],
        Downloads = downloads,
        Likes = likes,
        CreatedAt = DateTime.UtcNow.AddDays(-Rng.Next(1, 180))
    };
}

public class SeedModel
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string ThumbnailPath { get; set; } = "";
    public string Category { get; set; } = "";
    public string AuthorId { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public int Downloads { get; set; }
    public int Likes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Tags { get; set; } = [];
}
