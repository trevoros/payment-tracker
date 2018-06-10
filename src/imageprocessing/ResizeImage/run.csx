using ImageResizer;

public static void Run(
    Stream image,         // input blob, large size
    Stream imageMedium)  // output blobs
{
    var imageBuilder = ImageResizer.ImageBuilder.Current;

    image.Position = 0;
    var size = imageDimensionsTable[ImageSize.Medium];

    imageBuilder.Build(
        image, imageMedium,
        new ResizeSettings(size.Item1, size.Item2, FitMode.Max, null), false);
}

public enum ImageSize
{
    ExtraSmall, Small, Medium
}

private static Dictionary<ImageSize, Tuple<int, int>> imageDimensionsTable = new Dictionary<ImageSize, Tuple<int, int>>()
{
    { ImageSize.ExtraSmall, Tuple.Create(320, 200) },
    { ImageSize.Small,      Tuple.Create(640, 400) },
    { ImageSize.Medium,     Tuple.Create(800, 600) }
};
