import { async, TestBed } from '@angular/core/testing';
import { AppStorage, LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { CommonModule } from '@angular/common';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

describe('LocalStoreService', () => {
  beforeEach(async(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, StorageServiceModule],
      providers: [{ provide: AppStorage, useExisting: LOCAL_STORAGE }]
    }).compileComponents();
  }));

  it('should create', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    expect(service).toBeTruthy();
  });

  it('should set and get strings without subKey', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    service.setStorageObjectKeyValue({ primaryKey: 'noSubKey', value: 'I"m a value' });
    expect(service.getStorage({ primaryKey: 'noSubKey' })).toEqual({ undefined: 'I"m a value' });
  });

  it('should set and get strings with subKey', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    service.setStorageObjectKeyValue({ primaryKey: 'prime', subKey: 'sub', value: 'sub prime homes' });
    expect(service.getStorage({ primaryKey: 'prime', subKey: 'sub' })).toEqual({ sub: 'sub prime homes' });
  });

  it('should set and get objects', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    service.setStorageObjectKeyValue({ primaryKey: 'testObject', value: { test: 1 } });
    expect(service.getStorage({ primaryKey: 'testObject' })).toEqual({ undefined: { test: 1 } });
  });

  it('should set and get objects with subKey', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    service.setStorageObjectKeyValue({ primaryKey: 'testPrime', subKey: 'subKey', value: { test: 2 } });
    expect(service.getStorage({ primaryKey: 'testPrime', subKey: 'subKey' })).toEqual({ subKey: { test: 2 } });

    // Add to same subKey
    service.setStorageObjectKeyValue({ primaryKey: 'testPrime', subKey: 'subKey', value: { test2: 3 } });
    expect(service.getStorage({ primaryKey: 'testPrime', subKey: 'subKey' })).toEqual({ subKey: { test2: 3 } });
  });

  it('should get undefined for keys that do not exist', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    expect(service.getStorage({ primaryKey: 'noExist' })).toBeUndefined();
  });

  it('can update storage', () => {
    const service: LocalStoreService = TestBed.get(LocalStoreService);
    const key = 'notifications';
    service.updateStorage({ primaryKey: key });
    expect(service.getStorage({ primaryKey: key })).toEqual({});
  });
});
