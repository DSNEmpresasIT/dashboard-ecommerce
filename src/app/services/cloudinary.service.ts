import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',

})
export class CloudinaryService {
  private cloudName = environment.CLOUDNAME; 
  private preset = environment.PRESENT; 
  private API_KEY = environment.API_KEY;
  constructor(private http: HttpClient) {}

  // Método para subir una imagen a Cloudinary
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.preset);
    formData.append('cloud_name', this.cloudName)

    return this.http.post(`https://api.cloudinary.com/v1_1/${this.cloudName}image/upload?api_key=${this.API_KEY}`, formData)
    .pipe(
      map((response: any) => response) 
    );
  }

  async onEditImageSelected(oldUrl:string): Promise<void> {
    const currentImg = oldUrl 
    const publicId = this.extractPublicIdFromUrl(currentImg);
  
      if (publicId) {
        try {
          await this.deleteImage(publicId).toPromise();
          console.log('Old image deleted from Cloudinary');
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
        }
      }
  }

  deleteImage(publicId: string): Observable<any> {
    return this.http.delete(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy/${publicId}?upload_preset=${this.preset}`);
  }


  extractPublicIdFromUrl(url: string): string | null {
    const match = url.match(/\/v\d+\/([\w-]+)\/\w+$/);
    return match ? match[1] : null;
  }

}
