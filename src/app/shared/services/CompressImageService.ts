import { Injectable } from '@angular/core'
import { FormControl, ValidatorFn } from '@angular/forms'
import { FileInput } from 'ngx-material-file-input'
import { Observable } from 'rxjs'

// in bytes, compress images larger than 1MB
const fileSizeMax = 1 * 1024 * 256
// in pixels, compress images have the width or height larger than 1024px
const widthHeightMax = 1024
const defaultWidthHeightRatio = 1
const defaultQualityRatio = 0.7

@Injectable({
  providedIn: 'root'
})
export class CompressImageService {


  compress(file: File): Observable<File> {
    const imageType = file.type || 'image/jpeg'
    const reader = new FileReader()
    reader.readAsDataURL(file)

    return Observable.create(observer => {
      // This event is triggered each time the reading operation is successfully completed.
      reader.onload = ev => {
        // Create an html image element
        const img = this.createImage(ev)
        // Choose the side (width or height) that longer than the other
        const imgWH = img.width > img.height ? img.width : img.height

        // Determines the ratios to compress the image
        let withHeightRatio = (imgWH > widthHeightMax) ? widthHeightMax/imgWH : defaultWidthHeightRatio
        let qualityRatio = (file.size > fileSizeMax) ? fileSizeMax/file.size : defaultQualityRatio

        // Fires immediately after the browser loads the object
        img.onload = () => { 
          const elem = document.createElement('canvas')
          // resize width, height
          elem.width = img.width * withHeightRatio
          elem.height = img.height * withHeightRatio

          const ctx = <CanvasRenderingContext2D>elem.getContext('2d')
          ctx.drawImage(img, 0, 0, elem.width, elem.height)
          ctx.canvas.toBlob(
            // callback, called when blob created
            blob => { 
              observer.next(new File(
                [blob],
                file.name,
                {
                  type: imageType,
                  lastModified: Date.now(),
                }
              ))
            },
            imageType,
            qualityRatio, // reduce image quantity 
          )
        }
      }

      // Catch errors when reading file
      reader.onerror = error => observer.error(error)
    })
  }

  private createImage(ev) {
    let imageContent = ev.target.result
    const img = new Image()
    img.src = imageContent
    return img
  }


  fileMaxSize(maxSize: number): ValidatorFn {
    const validatorFn = (files: FileInput) => {
      const file = files.files[0];
      if (file instanceof File && file.size > maxSize) {
      
        return { fileMinSize: { requiredSize: maxSize, actualSize: file.size, file } };
      }
    };
    return this.fileValidation(validatorFn);
  }

  private fileValidation(validatorFn: (File) => null | object): ValidatorFn {
    return (formControl: FormControl) => {
      if (!formControl.value) {
        return null;
      }

      const files: File[] = [];
      const isMultiple = Array.isArray(formControl.value);
      isMultiple
        ? formControl.value.forEach((file: File) => files.push(file))
        : files.push(formControl.value);

      for (const file of files) {
        return validatorFn(file);
      }

      return null;
    };
  }
}