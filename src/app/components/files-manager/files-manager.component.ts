import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../interfaces/response';
import { AlertService, AlertsType } from '../../services/alert.service';
import { FilesService } from '../../services/global-api/files.service';
import { CommonModule } from '@angular/common';
import { FileData } from '../../interfaces/data';

@Component({
  selector: 'app-files-manager',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './files-manager.component.html',
  styleUrl: './files-manager.component.css'
})
export class FilesManagerComponent implements OnChanges {
  imageForm: FormGroup;
  @Input() data!: FileData;
  fileName: string = '';
  imageToUpload = false
  uploading = false
  constructor(
    private formBuilder: FormBuilder,
    private alertServ: AlertService,
    private fileService: FilesService){
    this.imageForm = this.formBuilder.group({
      img: [''], // For previewing the selected image
      images: this.formBuilder.array([]),
    });
  }

  get imagesArray(): FormArray {
    return this.imageForm.get('images') as FormArray;
  }

  ngOnChanges(): void {
    if (this.data) {
      this.syncFormWithInputData();
    }
  }

  private syncFormWithInputData(): void {
    this.imagesArray.clear();

    if (this.data.imagenes) {
      this.data.imagenes.value.forEach((image: any) => {
        this.imagesArray.push(
          this.formBuilder.group({
            id: [image.id],
            url: [image.url],
            loading: [false],
            cloudinary_id: [image.cloudinary_id]
          })
        );
      });
    }
  }
  
  addImage() {
    const images = this.imageForm.get('images') as FormArray;
    images.push(this.formBuilder.group({
      cloudinary_id: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }

  async onImageSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files || inputElement.files.length === 0) {
      this.fileName = 'Ningún archivo seleccionado'
    } else {
      const images: { file: File; preview: string; }[] = []
      for (let i = 0; i < inputElement.files.length; i++) {
        const file = inputElement.files[i];
        const reader = new FileReader();
        reader.onload = () => {
          const img = {
            file,
            preview: reader.result as string
          }
          images.push(img);
          this.addImageWithUrl(file.name, img.preview)
        };
        reader.readAsDataURL(file);
      }
    }
    this.imageToUpload = true
  }
  imagesToUpload() {
    const images = this.imageForm.get('images')?.value.find((img: any) => !img.id)
    this.imageToUpload = images && images.length !== 0
  }
  dataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ia], { type: mimeString })
  }
  addImageWithUrl(cloudinaryId: string, url: string) {
    const images = this.imageForm.get('images') as FormArray;
    images.push(this.formBuilder.group({
      id: [''],
      cloudinary_id: [cloudinaryId, Validators.required],
      url: [url, Validators.required],
      loading: [false]
    }));
  }
  async uploadImage(image: any): Promise<void> {
    this.uploading = true
    const loadingControl = image.get('loading');
    const cloudinaryId = image.get('cloudinary_id').value;
    const imageUrl = image.get('url').value;
    loadingControl.setValue(true);
    const companyId = this.data.payload?.user.companyId;
    if (!companyId || !this.data.productoId) return
    try {
      const imageBlob = this.dataURIToBlob(imageUrl);
      const formData = new FormData();
      formData.append('file', imageBlob, cloudinaryId);
      formData.append('companyId', companyId.toString());
      formData.append('productId', this.data.productoId);
      const response = await firstValueFrom(this.fileService.uploadFile(formData)) as ApiResponse
      image.get('id').setValue(response.content[0]);
      this.alertServ.show(3000, 'Imagen subida exitosamente', AlertsType.SUCCESS);
    } catch (error) {
      console.log(error, 'error en img')
      this.alertServ.show(3000, `Error al subir la imagen: ${cloudinaryId}`, AlertsType.ERROR);
    } finally {
      this.uploading = false
      loadingControl.setValue(false);
    }
    this.imagesToUpload()
  }
  async uploadImages() {
    try {
      const formData = new FormData();
      this.uploading = true
      let images = this.imageForm.get('images')?.value
      images.forEach((img: any) => {
        if (!img.id) {
          const imageBlob = this.dataURIToBlob(img.url);
          formData.append(`file`, imageBlob, img.cloudinary_id);
          img.loading = true
        }
      });
      this.imageForm.get('images')?.setValue(images)
      const companyId = this.data.payload?.user.companyId;
      if (!companyId || images.length === 0 || !this.data.productoId) return
      formData.append('companyId', companyId.toString());
      formData.append('productId', this.data.productoId);
      await firstValueFrom(this.fileService.uploadFile(formData));
      //TODO: cargar imagenes await this.loadProduct(this.data.productoId)
      this.uploading = false
    } catch (error) {
      this.alertServ.show(10000, `Ocurrió un error al subir las imágenes. Por favor, intenta nuevamente`, AlertsType.ERROR);
    } finally{
      this.uploading = false
    }
  }

 async removeFormItems(id: number, form: string, imageId?: any) {
    if (!imageId) {
      const itemToDelet = this.imageForm.get(`${form}`) as FormArray
      itemToDelet.removeAt(id);
      return
    }
    try {
      const companyId = this.data.payload?.user.companyId
      if (companyId) {
        await this.alertServ.showConfirmation(async () => {
          const itemToDelet = this.imageForm.get(`${form}`) as FormArray
          itemToDelet.value[id].loading = true
          this.imageForm.get('images')?.setValue(itemToDelet.value)
          await firstValueFrom(this.fileService.deleteFileById(companyId, imageId))
          itemToDelet.removeAt(id);
          this.alertServ.show(5000, "Eliminación realizada con éxito", AlertsType.SUCCESS);
        })
      }
    } catch (error: any) {
      this.alertServ.show(10000, `Ocurrió un error al intentar eliminar. Por favor, intente nuevamente.`, AlertsType.ERROR);
    }
  }


  // Modal img 

  
  @ViewChild('imageDialog') imageDialog!: ElementRef;


  openDialog() {
    this.imageDialog.nativeElement.showModal();
  }

  closeDialog(e: Event) {
    if (e && e.target === e.currentTarget) {
      this.imageDialog.nativeElement.close();
    }
  }


}
