import PIL.Image

def auto_crop_image(image_path):
  """Auto crop an image to only fit the contents of the image.

  Args:
    image_path: The path to the image file.

  Returns:
    A cropped image.
  """

  image = PIL.Image.open(image_path)

  # Get the bounding box of the non-transparent pixels.
  bbox = image.getbbox()

  # Crop the image to the bounding box.
  cropped_image = image.crop(bbox)

  return cropped_image


if __name__ == "__main__":
  image_path = "paitent.png"
  cropped_image = auto_crop_image(image_path)
  cropped_image.save("output.png")
