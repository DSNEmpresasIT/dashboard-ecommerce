import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as fs from 'fs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ImgAutomatizeUploadService {

  private cloudName = environment.CLOUDNAME;
  private API_KEY = environment.API_KEY;
  private preset = environment.PRESENT;

  constructor(private http: HttpClient) {
    //this.uploadImagesFromFolder('/imagenesFelix')
  }

  async uploadImagesFromFolder(folderPath: string): Promise<void> {
    try {

      const files = await this.readFolder(folderPath);
      for (const file of files) {
        const imageData = await this.readFileAsBase64(`${folderPath}/${file}`);
        const productId = file.split('.')[0];
        const imageUrl = await this.uploadImage(imageData);
        await this.updateSupabase(productId, imageUrl);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  }

  private readFolder(folderPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  private readFileAsBase64(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private uploadImage(imageData: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('upload_preset', this.preset);
    formData.append('cloud_name', this.cloudName);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload?api_key=${this.API_KEY}`, formData, { headers })
      .pipe(
        map((response: any) => response.secure_url)
      )
      .toPromise();
  }

  private updateSupabase(productId: string, imageUrl: string): Promise<any> {
    const supabaseUrl = `YOUR_SUPABASE_URL/products?id=eq.${productId}`;
    const supabaseApiKey = 'YOUR_SUPABASE_API_KEY';

    const updateData = { img_url: imageUrl };

    return this.http.patch(supabaseUrl, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'apikey': supabaseApiKey
      }
    }).toPromise();
  }
}
